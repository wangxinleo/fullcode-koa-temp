const { area_hash } = require("../config");

/**
 * 针对对象某一属性进行排序，asc正序，desc反序
 * @param obj 需要排序的对象
 * @param item 排序依据key
 * @param sortAttr 排序属性
 * @returns {*}
 */
const objectSort = (obj, item, sortAttr = 'asc') => {
  return obj.sort((obj1, obj2) => {
    let val1 = obj1[item];
    let val2 = obj2[item];
    if (sortAttr === 'asc') {
      if (val1 < val2) {
        return -1;
      } else if (val1 > val2) {
        return 1;
      } else {
        return 0;
      }
    } else {
      if (val1 > val2) {
        return -1;
      } else if (val1 < val2) {
        return 1;
      } else {
        return 0;
      }
    }
  });
};
/**
 * 对象数组去重函数
 * @param arr 对象数组
 * @param name 想要去重的属性
 * @returns {*} 已去重数组
 */
const unique = (arr, name) => {
  const res = new Map();
  return arr.filter((arr) => !res.has(arr[name]) && res.set(arr[name], 1));
};

/**
 * 将用逗号分隔的主体编码转化为对应数据库编码
 * @param str
 * @returns {[]}
 */
const strToArr = (str) => {
  const temp = str.split(',');
  let res = [];
  temp.forEach(value => {
    if (!area_hash[value]) throw new Error('AREAError');
    if (res.indexOf(area_hash[value]) === -1) res.push(area_hash[value]);
  });
  return res;
};

/**
 * 校验必填项
 * @param arr 形如[key]的必填参数数组
 * @param req 请求参数对象
 */
const checkReq = (arr, req) => {
  arr.forEach(value => {
    let temp = req[value];
    temp = temp ? (temp + '').replace(/\s*/g, "") : '';

    if (!temp) throw new Error(`${value} 必填!`);
  });
};

/**
 * 如果item1没有值，拷贝item2的值到item1
 * @param item1 拷贝
 * @param item2 被拷贝
 * @returns {*}
 */
const copyVal = (item1, item2) => {
  return item1 ? item1 : item2;
};
/**
 * 取出请求中的字段，组装SQL 的类型定义
 * @param obj 形如{'key': ['type','default]}的对象
 * @param req 请求参数对象
 * @returns {string}
 */
const postSqlType = (obj, req) => {
  let sqlType = '';
  Object.keys(obj).forEach((key) => {
    if (req[key] === undefined) return true;
    sqlType += `@${key} ${obj[key][0]},\n `;
  });
  return sqlType.substring(0, sqlType.lastIndexOf(','));
};

/**
 * 取出请求中的字段，组装SQL 的SET
 * @param obj 形如{'key': ['type','default]}的对象
 * @param req 请求参数对象
 * @returns {string}
 */
const postSqlSet = (obj, req) => {
  let sqlSet = '';
  Object.keys(obj).forEach((key) => {
    if (req[key] === undefined) return true;
    sqlSet += `set @${key} = '${req[key]}' \n`;
  });
  return sqlSet;
};

/**
 * 取出请求中的字段，组装insertSQL 的key
 * @param obj 形如{'key': ['type','default]}的对象
 * @param req 请求参数对象
 * @returns {string}
 */
const insertSqlKey = (obj, req) => {
  let sqlKey = '';
  Object.keys(obj).forEach((key) => {
    if (req[key] === undefined) return true;
    sqlKey += `${key},\n`;
  });
  return sqlKey.substring(0, sqlKey.lastIndexOf(','));
};

/**
 * 取出请求中的字段，组装insertSQL 的value
 * @param obj 形如{'key': ['type','default]}的对象
 * @param req 请求参数对象
 * @returns {string}
 */
const insertSqlVal = (obj, req) => {
  let sqlVal = '';
  Object.keys(obj).forEach((key) => {
    if (req[key] === undefined) return true;
    sqlVal += `@${key},\n`;
  });
  return sqlVal.substring(0, sqlVal.lastIndexOf(','));
};
/**
 * 取出请求中的字段，组装updateSql 的value
 * @param obj 形如{'key': ['type','default]}的对象
 * @param req 请求参数对象
 * @param neglectArr 需要忽略的字段数组
 * @returns {string}
 */
const updateSql = (obj, req, neglectArr = []) => {
  let sqlVal = '';
  Object.keys(obj).forEach((key) => {
    if (req[key] === undefined || neglectArr.indexOf(key) !== -1) return true;
    sqlVal += `${key} = @${key},\n`;
  });
  return sqlVal.substring(0, sqlVal.lastIndexOf(','));
};
/**
 * 有默认值变量在没有值的情况下赋予默认值
 * @param obj 形如{'key': ['type','default]}的对象
 * @param req 请求参数对象
 * @constructor
 */
const Nodata2default = (obj, req) => {
  // const temp = obj.filter((el)=>{return el[2] !== undefined})
  Object.keys(obj).forEach(key => {
    if (obj[key][1] !== undefined && req[key] === undefined) {
      req[key] = obj[key][1];
    }
  });
};

module.exports = {
  objectSort,
  unique,
  strToArr,
  checkReq,
  postSqlType,
  postSqlSet,
  insertSqlKey,
  insertSqlVal,
  Nodata2default,
  copyVal,
  updateSql
};
