const router = require('koa-router')();
const controller = require('../common');
const { apiPrePath } = require('../config');

router.prefix(apiPrePath + 'common');

router.post('/', controller.index);


module.exports = router;