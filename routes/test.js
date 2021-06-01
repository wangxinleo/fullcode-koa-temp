const router = require('koa-router')();
const { apiPrePath } = require('../config');
const { mysql_db } = require('../database/db');

router.prefix(apiPrePath + 'test');

router.get('/getTest', async (ctx) => {
	let { name } = ctx.query;

	if (!name) ctx.throw('RequestDataError');

	const sql = `
		select * from fullcodeTest where name = ?
  `;
	const res = await mysql_db.db03(sql, [name]);
	// console.log(mysql_db.db03.toString());

	return ctx.body = {
		status: 200,
		msg: '获取订单记录成功',
		result: res
	};
});

module.exports = router;