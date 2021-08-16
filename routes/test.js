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
	const sql2 = `
	select * from fullcodeTest
`;
	const res = await Promise.all([mysql_db.db03(sql, [name]), mysql_db.db03(sql2, [])]);
	// console.log(mysql_db.db03.toString());

	return ctx.body = {
		status: 200,
		msg: '获取订单记录成功',
		result: res
	};
});

// 云端IDE 代码提交测试

module.exports = router;