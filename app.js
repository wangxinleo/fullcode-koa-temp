const Koa = require('koa');
const cors = require('koa2-cors');
const app = new Koa();

const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const fs = require('fs')
const path = require('path')

const {routesUrl} = require('./config')
const timedTask = require('./timedtask/run');
const {
  cacheMiddleware,
  tokenMiddleware,
  loggerMiddleware,
  errorMiddleware,
  debounceMiddleware,
  versionMiddleware
} = require("./middleware");
const {errorInfo} = require('./utils/error');

//导入路由
const routes = {};
for (let item of fs.readdirSync(routesUrl)) {
  let routerName = path.win32.basename(item, '.js')
  routes[routerName] = require(path.resolve(routesUrl, routerName))
}

onerror(app);

// middlewares
app.use(cors());

app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}));
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/views/dist'));

app.use(views(__dirname + '/views/dist', {
  extension: 'html'
}));

// 定时任务
timedTask();

// logger
app.use(async (ctx, next) => {
  await loggerMiddleware(ctx, next)
});
// error
app.use(async (ctx, next) => {
  await errorMiddleware(ctx, next)
});
// 验权
app.use(async (ctx, next) => {
  await tokenMiddleware(ctx, next);
})
// 请求防抖
app.use(async (ctx, next) => {
  await debounceMiddleware(ctx, next);
})
// 添加版本信息
app.use(async (ctx, next) => {
  await versionMiddleware(ctx, next);
})
// cache
app.use(async (ctx, next) => {
  await cacheMiddleware(ctx, next);
})

// 路由映射
Object.keys(routes).forEach(key => {
  app.use(routes[key].routes(), routes[key].allowedMethods())
})

// error-handling
app.on('error', async (err, ctx) => {
  console.error('服务器 错误', err, ctx);
  errorInfo(ctx, err);
});

module.exports = app;
