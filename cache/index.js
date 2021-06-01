const fs = require('fs');
const path = require('path');
const { cacheEffeTime } = require('../config');

/**
 *  写入缓存
 * @param cachePath 缓存路径
 * @param obj req请求参数
 * @param body res.body主体
 * @returns {boolean}
 */
const writeCache = (cachePath, obj, body) => {
  // 有错误、超时，无数据时不写入
  if (!body || body.status !== 200) {
    return false;
  }
  // 拼接参数作为缓存key
  let key = getKey(obj);
  // 缓存时间
  body['dateTime'] = new Date().getTime();
  // 缓存地址
  let FileData = require(cachePath);
  // 存入数据
  FileData[key] = body;
  fs.writeFile(cachePath, JSON.stringify(FileData), 'utf8', err => {
    if (err) {
      throw ('writeError');
    }
  });
};

// 生成缓存KEY
const getKey = (obj) => {
  let key = "key_";
  for (item of Object.values(obj)) {
    key += item ? item + '_' : '';
  }
  return key;
};

// 递归创建目录
const createDirByPathSync = (cachePath) => {
  // 路径是否存在
  if (fs.existsSync(cachePath)) {
    return true;
  } else {
    // 查找上一路径是否存在
    if (createDirByPathSync(path.dirname(cachePath))) {
      // 创建文件夹
      fs.mkdirSync(cachePath);
      return true;
    }
  }
};

module.exports = {
  /**
   * 创建缓存
   * @param url 请求地址
   * @param obj req请求参数
   * @param body res.body主体
   */
  createCache: (url, obj, body) => {
    // 创建缓存路径
    let cachePath = path.resolve(__dirname, `.${url}`);
    createDirByPathSync(cachePath);
    cachePath = path.resolve(cachePath, 'index.json');
    // 写入缓存
    fs.writeFileSync(cachePath, '{}');
    writeCache(cachePath, obj, body);
  },
  /**
   * 获取缓存
   * @param url 请求地址
   * @param obj req请求参数
   * @returns {boolean|*} 成功标识
   */
  getCache: (url, obj) => {
    // 获取缓存地址
    const cachePath = path.resolve(__dirname, `./${url}`, 'index.json');
    // 获取缓存key
    let key = getKey(obj);
    try {
      // 查询缓存文件是否存在
      fs.accessSync(cachePath);
    } catch (e) {
      return false;
    }
    // 读取缓存
    let Data = require(cachePath);
    const nowTime = new Date().getTime();
    if (Data[key] && (nowTime - Data[key].dateTime <= 1000 * 60 * cacheEffeTime)) {
      return Data[key];
    } else {
      return false;
    }
  }
};
