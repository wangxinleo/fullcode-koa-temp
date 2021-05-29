const { mssql_db } = require('../database/db');

/**
 * 组合查询方法，根据区域或全区域查询数据库，返回结果Objvarect对象。
 * @param sql 查询语句
 * @param area 地区代号
 * @returns {Promise<{area: string, total: number, data: *[]}|{area: string, total: number, data: []}>}
 * @constructor
 */
const Select_SQL = async (keys, area, sql) => {
  // area 类型判定
  if (Object.prototype.toString.call(area) !== '[object Array]') {
    return {
      total: 0,
      area: '',
      data: []
    };
  }

  let dataAll = {};
  let data = [];
  let res_area = '';
  for (let item of area) {
    if (keys.indexOf(item) !== -1) {
      dataAll[item] = await mssql_db[item](sql).then(res => {
        !res.recordset ? res.recordset = [] : "";
        if (res.recordset.length === 0) {
          return {
            total: 0,
            data: []
          };
        }
        return {
          total: res.recordsets[0][0].total,
          data: res.recordsets[0]
        };
      }).catch(err => {
        console.log(`服务器请求错误：${err}`);
        if (err.code === 'ETIMEOUT') {
          return {
            total: 0,
            data: []
          };
        } else {
          return {
            total: 0,
            data: []
          };
        }
      });
    }
  }

  Object.keys(dataAll).forEach(key => {
    data = data.concat(dataAll[key].data);
    res_area += `${dataAll[key].area},`;
  });
  let res_area_arr = res_area.split(',');
  res_area_arr = res_area_arr.filter(item => item);
  res_area = res_area_arr.join(',');

  let total = data.length;

  return {
    total: total,
    area: res_area,
    data: data
  };

};

/**
 * SQL事务方法，对数据库进行操作如果有误将进行回滚。
 * @param sql 查询语句
 * @param area 地区代号
 * @returns {Promise<{area: string, total: number, data: *[]}|{area: string, total: number, data: []}>}
 * @constructor
 */
const Trans_SQL = async (area, ...sql) => {
  // area 类型判定
  if (Object.prototype.toString.call(area) !== '[object Array]') {
    throw new Error('AREAError');
  }

  for (let item of area) {
    await mssql_db[item + '_Trans'](...sql).then().catch(() => {
      throw new Error('RequestDataError');
    });
  }

};

module.exports = { Select_SQL, Trans_SQL };
