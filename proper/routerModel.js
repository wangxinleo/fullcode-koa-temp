/**
 * 本文件为路由模板文件，仅作为学习使用
 * 本文件的所有代码可以直接复制到一个新文件中进行新的路由文件进行开发。
 *
 */
const router = require('koa-router')();

const { apiPrePath } = require('../config');
const {
  strToArr,
  checkReq,
  postSqlType,
  postSqlSet,
  updateSql,
  NodataTodefault,
  insertSqlKey,
  copyVal,
  insertSqlVal
} = require("../utils");

// 如果复制本文件，请把routerModel改成跟文件名一致；
// 例如：index.js 则 router.prefix(apiPrePath + 'index');
router.prefix(apiPrePath + 'routerModel');

/**
 * get请求示例，一般用于查询表数据，不带更新和增加功能
 */
router.get('/getTest', async (ctx) => {
  // 1.取得query数据
  //
  // 例如：/getTest？num1=1&num2=2&AREA_CODE=dgyb,dgrb
  let { num1, num2, AREA_CODE } = ctx.query;

  // 2.校验必填项，如果不需要检验必填则忽略下方代码；
  //
  // 如果没填则会抛出错误到utils文件夹下的error.js返回相关信息
  if (!num1 || !num2 || !AREA_CODE) ctx.throw('RequestDataError');

  // 3.把要查询的区域代码转换成本平台可识别的数据库关键字
  //
  // 具体对应关系在 config/index.js 中查看
  // 例如：AREA_CODE=dgyb,dgrb， 则通过strToArr方法会转换成数组['dgyb','dgrb']给后续的数据库连接方法使用。
  // 例如：AREA_CODE=dgyb， 则通过strToArr方法会转换成数组['dgyb']
  // 例如：AREA_CODE=jx_hlc， 则通过strToArr方法会转换成数组['jx']
  let area = strToArr(AREA_CODE);

  // 4.拼接sql语句
  //
  // 字符串中可以使用 ${   } 使用某些变量中存储的str数据；例如：${CUST_CODE}
  //
  // ${   } 也可以使用三元运算符；
  // 例如 ${BOOL_ALL === 'true' ? '' : 'top 1'}
  // 如果BOOL_ALL为真则 返回字符串 ''，为假则返回 ‘top 1’
  const sql = `
  Begin Try
    Begin TransAction
    declare
      @T10_RKEY int
      select @T10_RKEY = Rkey from Data0010 where CUST_CODE = '${CUST_CODE}'
      select ${BOOL_ALL === 'true' ? '' : 'top 1'} t60.SALES_ORDER,
      T10.CUSTOMER_NAME,
      t60.CONF_DATE
      from Data0060 t60
      inner join  Data0010 t10 on t10.RKEY = t60.CUSTOMER_PTR
      where t60.CUSTOMER_PTR = @T10_RKEY order by t60.CONF_DATE desc
      Commit TransAction
  End Try
  Begin Catch
      Rollback TransAction
  End Catch

  `;
  // 5.执行查询
  // 这里是本平台已经封装好的select查询数据库的方法，如果只进行select操作，则推荐使用 Select_SQL(area, sql) 方法
  //
  //  @param area 地区代号 在config文件中的database.config.js中，用户定义的config.dbname中的dbname;
  //  比如 config.jx,则,传入['jx']
  //
  //  @param sql sql语句
  //  @returns 返回Promise对象，可直接拿到结果
  let res_data = await Select_SQL(area, sql);

  // 6.对数据中的一些结果进行操作
  // 如果不清楚返回的数据中有什么，可以console.log(res_data) 输出到控制台观察数据对象中有什么属性

  // 这里是判断res_data.total是否有数据，如果没有则表示查不到任何相关数据，返回Nodata
  if (!res_data.total) ctx.throw('NoData');

  // 7.成功响应，向客户端返回相关结果
  return ctx.body = {
    status: 200,
    msg: '获取订单记录成功',
    total: res_data.total,
    area: res_data.area,
    result: res_data.data
  };
});

/**
 * put请求示例，一般用于更新表数据，不带增加和查询功能
 */
router.put('/updateTest', async (ctx) => {
  // 1.取得body数据
  let req_body = ctx.request.body;


  // 2.校验必填项，如果不需要检验必填则忽略下方代码；
  //
  // 校验body中客户端给过来的数据中，是否有以下数组的中的数据，如果没填则会抛出错误到utils文件夹下的error.js返回相关信息
  checkReq(['EMPL_CODE', 'CUST_CODE', 'AREA_CODE', 'SHP_ADDR2_FOR_FORM'], req_body);

  // 3.验证数据规范
  //
  // 有些数据在数据库中是rkey的形式存在，如果客户端有传回这些数据，需要在这里做校验
  if ([1, 2, 3].indexOf(req_body.CREDIT_RATING) === -1) ctx.throw('RequestDataError');

  // 4.把要查询的区域代码转换成本平台可识别的数据库关键字
  //
  // 具体对应关系在 config/index.js 中查看
  // 例如：AREA_CODE=dgyb,dgrb， 则通过strToArr方法会转换成数组['dgyb','dgrb']给后续的数据库连接方法使用。
  // 例如：AREA_CODE=dgyb， 则通过strToArr方法会转换成数组['dgyb']
  // 例如：AREA_CODE=jx_hlc， 则通过strToArr方法会转换成数组['jx']
  let area = strToArr(req_body.AREA_CODE);

  // 5.拼接sql语句


  // 6.执行sql事务，错误时回滚，并报错
  //
  // area 地区代号
  // sql 查询语句,如果有多个SQL，在逗号后继续传入，用逗号隔开，会根据传入顺序依次执行
  await Trans_SQL(area, sql1, sql2);

  // 7.返回成功
  ctx.response.status = 201;
  return ctx.body = {
    status: 201,
    msg: '客户信息更新成功'
  };
});

/**
 * post请求示例，一般用于新增表数据，不带更新和查询功能
 */
router.post('/addTest', async (ctx) => {
  // 1.取得body数据
  let req_body = ctx.request.body;

  // 2.设置默认值
  //
  // 在许多表数据中，会有许多不想传数据，要使用默认值的情况，

  NodataTodefault(tb.D0010Tpye, req_body);
  NodataTodefault(tb.D0012Tpye, req_body);

  // 3.校验必填
  //
  // 有些数据在数据库中是rkey的形式存在，如果客户端有传回这些数据，需要在这里做校验
  checkReq(tb.D0010Must, req_body);
  checkReq(tb.D0012Must, req_body);
  checkReq(['EMPL_CODE', 'BUSINESS_AREA_CODE', 'FACTORY_AREA_CODE'], req_body);

  // 4.相同值字段
  // 在对多数据表插值时，有可能他01表中有city字段，02表有city02字段，但是他们的值是一样的
  // 这个时候就要利用以下方法对一些相同value的字段进行赋值，这样就不需要前端多传很多相同的数据。
  // --公司全称
  req_body.LOCNAME_FOR_FORM = copyVal(req_body.LOCNAME_FOR_FORM, req_body.CUSTOMER_NAME);
  //  -- 公司地址
  req_body.SHP_ADDR1_FOR_FORM = copyVal(req_body.SHP_ADDR1_FOR_FORM, req_body.SHIP_TO_ADDRESS_1);
  // -- 联系电话
  req_body.S4_BARCODE_LABLE = copyVal(req_body.S4_BARCODE_LABLE, req_body.SHIP_TO_PHONE);
  //-- 联系人
  req_body.S3_BARCODE_LABLE = copyVal(req_body.S3_BARCODE_LABLE, req_body.SHIP_TO_CONTACT);
  //-- 装箱单
  req_body.overship_flag = copyVal(req_body.overship_flag, req_body.APPLY_IN_TRANSIT);
  // 城市
  req_body.LOCATION = copyVal(req_body.LOCATION, req_body.STATE);
  // 网址
  req_body.SHIP_TO_ADDRESS_2 = copyVal(req_body.SHIP_TO_ADDRESS_2, req_body.BILLING_ADDRESS_2);


  // 5.验证数据规范
  //
  // 有些数据在数据库中是rkey的形式存在，如果客户端有传回这些数据，需要在这里做校验
  if ([1, 2, 3].indexOf(parseInt(req_body.CREDIT_RATING)) === -1
    || [1, 2, 3, 4].indexOf(parseInt(req_body.CUSTOMER_TYPE)) === -1
    || [0, 1].indexOf(parseInt(req_body.REG_TAX_FIXED_UNUSED)) === -1
    || [0, 1].indexOf(parseInt(req_body.CONSUME_FORECASTS)) === -1
    || [0, 1, 2, 3].indexOf(parseInt(req_body.APPLY_IN_TRANSIT)) === -1
    || [0, 1].indexOf(parseInt(req_body.DO_SMOOTHING)) === -1
    || [true, false].indexOf(req_body.quote_flag === true) === -1
  ) {
    ctx.throw('RequestDataError');
  }

  // 6.把要查询的区域代码转换成本平台可识别的数据库关键字
  //
  // 具体对应关系在 config/index.js 中查看
  // 例如：AREA_CODE=dgyb,dgrb， 则通过strToArr方法会转换成数组['dgyb','dgrb']给后续的数据库连接方法使用。
  // 例如：AREA_CODE=dgyb， 则通过strToArr方法会转换成数组['dgyb']
  // 例如：AREA_CODE=jx_hlc， 则通过strToArr方法会转换成数组['jx']
  let area = strToArr(req_body.AREA_CODE);


  // 8.执行sql事务，错误时回滚，并报错
  //
  // area 地区代号
  // sql 查询语句,如果有多个SQL，在逗号后继续传入，用逗号隔开，会根据传入顺序依次执行
  await Trans_SQL(area, sql1, sql2);

  // 9.返回成功
  ctx.response.status = 201;
  return ctx.body = {
    status: 201,
    msg: '客户信息新建成功'
  };
});

/**
 * delete请求示例，一般用于删除表数据，不带更新、新增和查询功能
 */
router.delete('/deleteTest', async (ctx) => {
  // 1.取得body数据
  let { ID, AREA_CODE } = ctx.request.body;

  // 2.校验必填项，如果不需要检验必填则忽略下方代码；
  //
  // 校验body中客户端给过来的数据中，是否有的数据，如果没填则会抛出错误到utils文件夹下的error.js返回相关信息
  if (!ID || !AREA_CODE) ctx.throw('RequestDataError');


  // 3.把要查询的区域代码转换成本平台可识别的数据库关键字
  //
  // 具体对应关系在 config/index.js 中查看
  // 例如：AREA_CODE=dgyb,dgrb， 则通过strToArr方法会转换成数组['dgyb','dgrb']给后续的数据库连接方法使用。
  // 例如：AREA_CODE=dgyb， 则通过strToArr方法会转换成数组['dgyb']
  // 例如：AREA_CODE=jx_hlc， 则通过strToArr方法会转换成数组['jx']
  let area = strToArr(AREA_CODE);

  const sql = `
    DELETE FROM table01 WHERE key = '${ID}' 
  `;

  // 4.执行sql事务，错误时回滚，并报错
  //
  // area 地区代号
  // sql 查询语句,如果有多个SQL，在逗号后继续传入，用逗号隔开，会根据传入顺序依次执行
  await Trans_SQL(area, sql);

  // 9.返回成功
  ctx.response.status = 204;
  return ctx.body = {
    status: 204,
    msg: '用户删除数据成功'
  };
});

module.exports = router;
