const request = require('request');

/**
 * 向第三方接口get请求
 * @param url
 * @param PartNumber
 * @returns {Promise<object>}
 */
const get2others = (url, PartNumber) => {
  return new Promise(resolve => {
    request(url, function (error, response) {
      if (!error || response.statusCode === 200) {
        resolve(response);
      }
    });
  });

};

/**
 * 向第三方接口post请求
 * @param url
 * @param requestData
 * @returns {Promise<object>}
 * @constructor
 */
const post2others = (url, requestData) => {

  return new Promise((resolve) => {
    request({
      url: url,
      method: "POST",
      json: true,
      headers: {
        "content-type": "application/json",
      },
      body: requestData
    }, function (error, response, body) {
      if (!error || response.statusCode === 200) {
        resolve(body);
      }
    });
  });

};

module.exports = {
  get2others,
  post2others
};
