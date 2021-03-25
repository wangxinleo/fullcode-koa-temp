const request = require('request');

/**
 * 删除CRM派工系统的失效的派工记录
 * @param url
 * @param PartNumber
 * @returns {Promise<object>}
 */
const deleteWaitDispatchByPartNumber = (url, PartNumber) => {

  return new Promise(resolve => {
    request(url, function (error, response) {
      if (!error || response.statusCode === 200) {
        console.log(`删除CRM数据库 - ${PartNumber}`);
        resolve(response);
      }
    });
  });

};

/**
 * 推送派工信息到crm
 * @param url
 * @param requestData
 * @returns {Promise<object>}
 * @constructor
 */
const PostWaitDispatch = (url, requestData) => {

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

const GetExistedUid = (url) => {
  return new Promise((resolve, reject) => {
    request(url, function (error, response) {
      if (response.body === 'True') {
        resolve(true)
      } else {
        reject(new Error('authorityError'))
      }
    })
  })
}


module.exports = {
  deleteWaitDispatchByPartNumber,
  PostWaitDispatch,
  GetExistedUid
};
