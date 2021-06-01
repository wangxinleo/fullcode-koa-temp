const mssql = require('mssql');
const mysql2 = require('mysql2');
const async = require('async');
const { promisify } = require('util');
const series = promisify(async.series);

// 载入配置
const configInit = (config, deploy) => {
  Object.keys(config).forEach(key => {
    Object.assign(config[key], deploy);
  });
  return config;
};
/**
 * MSSQL初始化连接
 * @param config 数据库配置
 * @returns {{}}
 */
const mssqlInit = (config) => {
  const db = {};
  Object.keys(config).forEach(key => {
    // 创建连接池并获取连接方法
    db[key] = mssqlConnection(mssqlCreatePool(config[key]));
    db[key + '_Trans'] = mssqlTransaction(mssqlCreatePool(config[key]));
  });
  return db;
};

const mysqlInit = (config) => {
  const db = {};
  Object.keys(config).forEach(key => {
    db[key] = mysqlConnection(mysqlCreatePool(config[key]));
  });
  return db;
};

/**
 * MSSQL创建连接池
 * @param config 数据库配置文件
 * @returns {ConnectionPool}
 */
const mssqlCreatePool = (config) => {
  return new mssql.ConnectionPool(config, err => {
    if (err) console.log('pool首次连接超时,将会在使用时再次连接');
  });
};

const mysqlCreatePool = (config) => {
  return mysql2.createPool(config);
};

/**
 * MSSQL创建连接
 * @param con 连接池
 * @returns {function(*=): Promise<>}
 */
const mssqlConnection = (con) => {
  return async (sql) => {
    await con.connect();
    try {
      const request = con.request();
      return await request.query(sql);
    } catch (e) {
      return new Promise((resolve, reject) => {
        reject(e);
      });
    }
  };
};

const mysqlConnection = (con) => {
  return async (sql, arrParam) => {
    return await con.promise().execute(sql, arrParam).then(([res]) => {
      console.log(res);
      return res;
    }).catch(err => {
      console.log(`err:` + err);
      return err;
    });
  };
};

/**
 * MSSQL创建事务
 * @param con 连接池
 * @returns {function(...[*]): Promise<>}
 */
const mssqlTransaction = (con) => {
  return async (...sql) => {
    await con.connect();
    const transaction = new mssql.Transaction(con);
    //开启事务
    await transaction.begin();
    //定义一个变量,如果自动回滚,则监听回滚事件并修改为true,无须手动回滚
    let rolledBack = false;

    //监听回滚事件
    transaction.on('rollback', aborted => {
      console.log('监听回滚');
      console.log('aborted值 :', aborted);
      rolledBack = true;
    });
    //监听提交事件
    transaction.on('commit', function () {
      console.log('监听提交');
      rolledBack = true;
    });

    const request = new mssql.Request(transaction);
    let queryArr = [];

    sql.forEach(value => {
      queryArr.push((callback) => {
        request.query(value, (err, res) => {
          if (err) {
            console.log('语句错误--' + err);
            callback(err, null);
          } else {
            callback(null, res);
          }
        });
      }
      );
    });
    return series(queryArr).then(res => {
      return new Promise(resolve => {
        console.log('无错误,执行提交');
        //执行提交
        transaction.commit((err) => {
          if (err) {
            console.log('commit err :', err);
            return;
          }
          console.log('提交成功');
        });
        resolve(res);
      });
    }).catch(err => {
      return new Promise((resolve, reject) => {
        console.log('出现错误,执行回滚');
        if (!rolledBack) {
          transaction.rollback((err) => {
            if (err) {
              console.log('rollback err :', err);
            } else {
              console.log('回滚成功');
            }
          });
        }
        reject(err);
      });
    });

  };
};

// // 现有数据库集合
// let keys = [];
// // 获取现有数据库集合
// function db_keys () {
//   Object.keys(config).forEach(key => {
//     keys.push(key);
//   });
// }

// db_keys();
module.exports = { configInit, mssqlInit, mysqlInit };
