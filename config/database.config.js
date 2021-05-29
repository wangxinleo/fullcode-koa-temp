const { connectionTimeout, requestTimeout, enableArithAbort, pool_max, idleTimeoutMillis } = require('./index');
// MSSQL配置信息
const MSSQLConfig = {
  db01: {
    area: "数据库1",
    user: "user",
    password: "password",
    server: "127.0.0.1",
    database: "database",
    port: 1433,
  },
  db02: {
    area: "数据库2",
    user: "user",
    password: "password",
    server: "127.0.0.1",
    database: "database",
    port: 1433,
  }
};

// MSSQL数据库设置参数
const MSSQLDeploy = {
  connectionTimeout: connectionTimeout,
  requestTimeout: requestTimeout,
  options: {
    encrypt: false,
    enableArithAbort: enableArithAbort,
  },
  pool: {
    min: 0,
    max: pool_max,
    idleTimeoutMillis: idleTimeoutMillis * 60 * 1000,
  },
};

// MYSQL配置信息
const MYSQLConfig = {
  db03: {
    host: 'localhost',
    database: 'test',
    user: 'root',
    password: 'root'
  }
};
// MySQL数据库设置参数
const MYSQLDeploy = {
  connectionLimit: 5
};


module.exports = { MSSQLConfig, MSSQLDeploy, MYSQLConfig, MYSQLDeploy };
