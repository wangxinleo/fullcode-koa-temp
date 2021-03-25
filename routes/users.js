const router = require('koa-router')()
const jwt = require('jwt-simple')

const {apiPrePath, tokenSecret, tokenExpired, crmReqUrl} = require('../config')
const {GetExistedUid} = require('../request')

router.prefix(apiPrePath + 'users')

router.post('/getAuthInfo', async (ctx) => {
  const {crm_uid} = ctx.req.headers
  const uidUrl = `${crmReqUrl}/Common/GetUserByUid?UID=${crm_uid}`
  let tempBool = await GetExistedUid(uidUrl);
  if (!tempBool) throw new Error('authorityError')
  const tokenTime = new Date().getTime() + 60 * 1000 * tokenExpired
  const token = jwt.encode({
    userid: crm_uid,
    exp: tokenTime,
    permissions: "vip",
  }, tokenSecret)
  return ctx.body = {
    code: 200,
    msg: "授权成功",
    data: {
      accessToken: token,
    },
  }
})

module.exports = router
