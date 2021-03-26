const jwt = require('jwt-simple');

const { errorInfo } = require("../utils/error");
const { GetExistedUid } = require("../request");
const { createCache, getCache } = require("../cache");
const {
  cacheFeatures,
  tokenFeatures,
  tokenExpired,
  tokenSecret,
  crmReqUrl,
  debounceFeatures,
  debounceFrequency,
  AutoRenewal,
  debounceCount,
  version
} = require("../config");

// 用户请求记录
const userReqList = {};

/**
 * 获取token
 * @param crm_uid
 * @returns {Promise<string>}
 */
async function getAuthInfo (crm_uid) {
  //验证uid有效性
  const uidUrl = `${crmReqUrl}/Common/GetUserByUid?UID=${crm_uid}`;
  const tempBool = await GetExistedUid(uidUrl);
  if (!tempBool) throw new Error('authorityError');
  const tokenTime = new Date().getTime() + 60 * 1000 * tokenExpired;
  //  返回新token
  return jwt.encode({
    userid: crm_uid,
    exp: tokenTime,
    permissions: "vip",
  }, tokenSecret);
}

module.exports = {
  // logger
  loggerMiddleware: async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    //控制台输出日志
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
  },
  // error
  errorMiddleware: async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      // 错误匹配
      errorInfo(ctx, err);
    }
  },
  // token
  tokenMiddleware: async (ctx, next) => {
    if (!tokenFeatures) return await next();
    const { crm_uid } = ctx.req.headers;
    const accessToken = ctx.cookies.get('userInfo');

    if (!accessToken) {
      // 验证crm_uid
      if (!crm_uid) return ctx.throw('authorityError');
      // 获取token
      let token = await getAuthInfo(crm_uid);
      // 返回token
      ctx.cookies.set('userInfo', token,
        {
          maxAge: tokenExpired * 60 * 1000,
          overwrite: true
        });
    } else {
      // 验证token
      // 解码accessToken
      const code = jwt.decode(accessToken, tokenSecret);
      // 验证权限、是否过期
      if (code.permissions !== 'vip' || code.exp < Date.now()) {
        ctx.throw('authorityError');
      }
      // 时间过半自动续期
      if (AutoRenewal && code.exp < Date.now() + 60 * 1000 * (tokenExpired / 2)) {
        let token = await getAuthInfo(code.userid);
        // 返回续期后的token
        ctx.cookies.set('userInfo', token,
          {
            maxAge: tokenExpired * 60 * 1000,
            overwrite: true
          });
      }
      // 给请求补上uid
      if (!crm_uid) ctx.req.headers.crm_uid = code.userid;
    }
    await next();

  },
  // debounce
  debounceMiddleware: async (ctx, next) => {
    if (!debounceFeatures) return await next();
    const { crm_uid } = ctx.req.headers;
    // 验证是否携带uid
    if (!crm_uid) return ctx.throw('userError');
    // 查找用户请求记录
    const timeBool = userReqList[crm_uid] ? Date.now() - userReqList[crm_uid].time < debounceFrequency : false;
    if (userReqList[crm_uid] && timeBool) {
      userReqList[crm_uid].count++;
      const methodBool = userReqList[crm_uid].method === ctx.request.req.method;
      const urlBool = userReqList[crm_uid].url === ctx.originalUrl;
      const countBool = userReqList[crm_uid].count >= debounceCount;
      // 短时间内多次请求，拒绝
      if (methodBool && urlBool && countBool) {
        return ctx.throw('debounce');
      }
    } else {
      // 记录用户请求记录
      userReqList[crm_uid] = {
        method: ctx.request.req.method,
        time: Date.now(),
        url: ctx.originalUrl,
        count: 0
      };
    }
    await next();
  },
  // version
  versionMiddleware: async (ctx, next) => {
    ctx.append('version', version);
    await next();
  },
  // cache
  cacheMiddleware: async (ctx, next) => {
    if (!cacheFeatures) return await next();
    // cache仅GET请求生效,图标不缓存
    if (ctx.request.method !== 'GET' || ctx.req._parsedUrl.pathname.indexOf('favicon.ico') !== -1) await next();
    //查询请求是否存在有效cache
    const Data = getCache(ctx.req._parsedUrl.pathname, ctx.query);
    if (!Data) {
      //进行请求，并创建缓存
      await next();
      createCache(ctx.req._parsedUrl.pathname, ctx.query, ctx.body);
    } else {
      console.log(`查询到有效缓存，加载缓存……`);
      // 直接返回缓存
      return ctx.body = Data;
    }
  }
};
