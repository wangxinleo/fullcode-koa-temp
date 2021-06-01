const { configInit, mssqlInit, mysqlInit } = require('../database/database.function.js');
const { MSSQLConfig, MSSQLDeploy, MYSQLConfig, MYSQLDeploy } = require('../config/database.config');
const mssqlConfig = configInit(MSSQLConfig, MSSQLDeploy);
const mysqlConfig = configInit(MYSQLConfig, MYSQLDeploy);
const mssql_db = mssqlInit(mssqlConfig);
const mysql_db = mysqlInit(mysqlConfig);
module.exports = { mssql_db, mysql_db };
