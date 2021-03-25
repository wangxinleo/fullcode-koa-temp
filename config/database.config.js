const { connectionTimeout, requestTimeout, enableArithAbort, pool_max, idleTimeoutMillis } = require('./index');
// MSSQL配置信息
let config = {
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

// 数据库设置参数（无必要情况勿动）
const deploy = {
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

module.exports = { config, deploy };
