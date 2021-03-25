const moment = require('moment');

const {PostWaitDispatch} = require("../request");
const {crmReqUrl} = require("../config");
const {FactArea} = require("../config/database.config")
const {addAreaCode} = require("../routesFunc/customers");
const {Select_SQL} = require("../utils/dbMiddleware");


/**
 * 定时任务
 *    每30分钟获取待制作的本厂编号进CRM派工数据库
 */
function postManuPartNumberToCRM() {
  return async () => {
    const camUrl = `${crmReqUrl}/CAMDispatch/HX_CamWaitDispatch`;
    const miUrl = `${crmReqUrl}/MIDispatch/HX_WaitDispatch`;
    const sql = `
  select MANU_PART_NUMBER,
       D15.WAREHOUSE_NAME,
       D15.WAREHOUSE_CODE,
       d10.CUST_CODE,
       d10.CUSTOMER_NAME,
       substring(MANU_PART_NUMBER,1,1) as PRE,
       d08.category,
       LAST_MODIFIED_DATE
  from data0025 d25
           left join data0015 d15 on d15.RKEY = d25.PROD_ROUTE_PTR
           left join data0010 d10 on d10.RKEY = d25.CUSTOMER_PTR
          left join data0008 d08 on d08.RKEY = d25.PROD_CODE_PTR
  where tstatus = 0
    and parent_ptr is null
    and DateDiff(dd,LAST_MODIFIED_DATE,getdate())=0
  `;

    let res_data = await Select_SQL(FactArea, sql);

    try {
      res_data.data.forEach((value) => {
        // 添加所属厂代码
        value.AREA_CODE = addAreaCode(value);
        // js时间会自动转换成中国时区时间
        value.LAST_MODIFIED_DATE = moment(value.LAST_MODIFIED_DATE - 8 * 60 * 60 * 1000).format('YYYY-MM-DD HH:mm:ss ');

        // 组装数据
        let requestData =
          {
            "Type": value.PRE,
            "CustomerName": value.CUSTOMER_NAME,
            "CustomerCode": value.CUST_CODE,
            "FactoryNumber": value.MANU_PART_NUMBER,
            "ProductCategory": value.category,
            "SubordinateFactory": value.AREA_CODE,
            "CreatedTime": value.LAST_MODIFIED_DATE
          };
        // 发送请求
        PostWaitDispatch(camUrl, requestData);
        PostWaitDispatch(miUrl, requestData);
      });
      console.log(`--------------------------------`);
      console.log(`cam派工导入代理异步执行启动`);
      console.log(`mi派工导入代理异步执行启动`);
      console.log(`--------------------------------`);
    } catch (e) {
      throw(e.message);
    }
  };
}

module.exports = {postManuPartNumberToCRM};
