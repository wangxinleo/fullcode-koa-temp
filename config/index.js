module.exports = {
  // 接口版本号
  version: '1.0.0',
  // CRM系统公共接口地址
  crmReqUrl: 'https://127.0.0.1:8010',
  // API路径公共前缀
  apiPrePath: '/api/',
  // 路由路径
  routesUrl: './routes',

  /**
   * 数据库配置
   */

  // 数据库连接超时时间ms(毫秒)
  connectionTimeout: 2000,
  // 请求超时时间ms(毫秒)
  requestTimeout: 5000,
  // MSSQL是否支持多次查询
  enableArithAbort: true,
  // MSSQL连接池允许的最大线程个数
  pool_max: 10,
  // MSSQL连接池线程闲置*(分钟)后销毁
  idleTimeoutMillis: 30,

  /**
   * 缓存功能配置
   * 用于应对客户端频繁发送请求时，在约定时间内仅返回缓存数据，减少连接数据库频次，提高数据库性能
   */

  // 是否启用缓存功能
  cacheFeatures: true,
  // 缓存有效时间(分钟)
  cacheEffeTime: 10,

  /**
   * 权限认证功能配置
   * 用于应对不明用户或权限不足用户越权调用接口，需要客户端在请求头headers中传入crm_uid参数
   */

  //  是否启用权限认证功能
  tokenFeatures: false,
  // token验证公钥
  tokenSecret: '1340fdv01',
  // token过期时间(分钟)
  tokenExpired: 60,
  // 是否允许时间过半自动续期
  AutoRenewal: true,

  /**
   * 请求防抖功能配置
   * 用于应对客户端恶意在限定时间内多次调用同一接口，需要客户端在请求头headers中传入crm_uid参数或开启权限认证功能
   */

  // 是否启用请求防抖
  debounceFeatures: false,
  // 防抖频率（*ms内连续请求N次同一地址后，将被拒绝）
  debounceFrequency: 5000,
  // 请求(N)次数限制
  debounceCount: 10

};

