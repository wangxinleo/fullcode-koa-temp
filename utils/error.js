const errorInfo = (ctx, err) => {
  switch (err.message) {
    case 'AREAError' :
    case 'RequestDataError' :
    case 'FactoryNumberError' :
    case 'PageError' :
      ctx.response.status = 400;
      return ctx.body = {
        status: 400,
        msg: err.message
      };
    case 'debounce' :
      ctx.response.status = 400;
      return ctx.body = {
        status: 400,
        msg: '请求过于频繁，服务器已拒绝!'
      };
    case 'authorityError':
      ctx.response.status = 401;
      return ctx.body = {
        status: 401,
        msg: '用户没有权限（令牌、用户名、密码错误）!'
      }
    case 'userError':
      ctx.response.status = 401;
      return ctx.body = {
        status: 401,
        msg: '请出示身份id!'
      }
    case 'NoData':
      ctx.response.status = 404;
      return ctx.body = {
        status: 404,
        msg: err.message
      };
    case 'ServerTimeout Or RequestError':
      ctx.response.status = 500;
      return ctx.body = {
        status: 500,
        msg: err.message
      };
    default:
      console.log(err);
      ctx.response.status = 500;
      return ctx.body = {
        status: 500,
        msg: err.message
      };
  }
};


module.exports = {errorInfo};
