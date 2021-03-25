const {postManuPartNumberToCRM} = require("./");

// 定时任务执行函数
function onload() {
  // setTimeout(postManuPartNumberToCRM(), 1000);
  console.log('定时器已成功启动！');
  setInterval(postManuPartNumberToCRM(), 30 * 60 * 1000);
}

module.exports = onload;