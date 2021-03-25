const {configInit, dbInit} = require('../database/database.function.js');

const config = configInit();

const db = dbInit(config);

module.exports = db;
