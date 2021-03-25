const {objectSort} = require("../utils");
const {area_code} = require("../config");

/**
 * 配合Select_SQL返回的res_data.data中的数据使用，根据所属厂编号和所属厂全称判断主体编码
 * @param value res_data.data的子对象
 * @returns {string} 主体编号
 */
const addAreaCode = (value) => {
  if (value.WAREHOUSE_CODE.indexOf('W') !== -1 && value.WAREHOUSE_NAME.indexOf('梅州') !== -1) {
    return 'mzwz';
  } else {
    return area_code[value.WAREHOUSE_CODE];
  }
};

/**
 * 配合Select_SQL返回的res_data.data中的数据使用，合并各数据库相同的客户信息
 * @param data
 * @returns {*}
 */
const pooledData = (data) => {
  //根据客户代码正序排序
  objectSort(data, 'CUST_CODE');

  try {
    data.forEach((value, index) => {
      // 添加主体代码
      value.AREA_CODE = addAreaCode(value);
      // 跨数据库数据去重
      while (value.CUST_CODE === data[index + 1].CUST_CODE) {

        // 合并 所属厂编号
        if (value.WAREHOUSE_CODE.indexOf(data[index + 1].WAREHOUSE_CODE) === -1) {
          value.WAREHOUSE_CODE += ',' + data[index + 1].WAREHOUSE_CODE;
        }
        // 合并 建档公司
        if (value.WAREHOUSE_NAME.indexOf(data[index + 1].WAREHOUSE_NAME) === -1) {
          value.WAREHOUSE_NAME += ',' + data[index + 1].WAREHOUSE_NAME;
        }

        // 合并 所属工厂简称
        if (value.ABBR_NAME.indexOf(data[index + 1].ABBR_NAME) === -1) {
          value.ABBR_NAME += ',' + data[index + 1].ABBR_NAME;
        }
        // 合并 所属厂编号
        // W0001 W0002 在深圳和梅州有歧异
        const TEMP_CODE = addAreaCode(data[index + 1]);
        if (value.AREA_CODE.indexOf(TEMP_CODE) === -1) {
          value.AREA_CODE += ',' + TEMP_CODE;
        }
        // 删除重复记录
        data.splice(index + 1, 1);
      }
    });
    //根据最后更新时间倒序
    objectSort(data, 'LAST_UPDT', 'desc');

    return data;
  } catch (e) {
    if (e.message !== "Cannot read property 'CUST_CODE' of undefined") {
      throw(e);
    } else {
      objectSort(data, 'LAST_UPDT', 'desc');
      return data;
    }
  }
};

/**
 * 数据分页模块
 * @param res_data 需要分割的数据
 * @param page 页码
 * @param pageSize 每页页数
 * @returns {Promise<Array>}
 * @constructor
 */
const DataPaging = (res_data, page, pageSize) => {
  const data = res_data.slice((page - 1) * pageSize, page * pageSize);
  return new Promise((resolve, reject) => {
    if (data.length === 0) {
      // 页码溢出
      reject(new Error('PageError'));
    } else {
      resolve(data);
    }
  });
};


module.exports = {addAreaCode, pooledData, DataPaging};
