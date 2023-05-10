import { log } from 'console'
import { Context, Schema } from 'koishi'

export const name = 'koishi-api'
const descriptions = {
  path: 'API 路径',
  enable: '是否开启 API ',
  secrets: '用于 API 权限验证, 把他放在 HTTP 请求头的 Koishi-Api-Secrets 字段里'
}
export interface Config {
  path: string
  enable: boolean
  secrets: string
}

interface RequestBody {
  botId: string;
  platform: string;
  data: any;
  function: string;
}

export const Config: Schema<Config> = Schema.object({
  path: Schema.string().default("/koishi-api").description(descriptions.path),
  enable: Schema.boolean().default(false).description(descriptions.enable),
  secrets: Schema.string().description(descriptions.secrets)
})


export function apply(ctx: Context, config: Config) {

  ctx.router.all(config.path, async (koa, next) => {
    if (!config.enable) {
      return fail(koa, 'API 未开启', next)

    }
    let authorization = koa.request.headers.authorization
    if (config.secrets && authorization !== config.secrets) {
      return fail(koa, '无效的 API 密钥', next)
    }

    const method = koa.method.toUpperCase()
    if ("POST" !== method) {
      return fail(koa, '仅支持 POST 请求', next)

    }

    let data: RequestBody | undefined

    data = koa.request.body
    console.log(data)

    if (!data.botId) {
      return fail(koa, '缺少 botId', next)
    }
    if (!data.platform) {
      return fail(koa, '缺少 平台', next)
    }

    if (!data.function) {
      return fail(koa, '缺少 function', next)
    }
    const bot = ctx.bots.find((bot) => bot.platform === data.platform && bot.selfId === data.botId);
    console.log(`发生调用:${data}`)
    try {

      switch (data.function) {
        case "getGroupRecentMessages": {
          if (!data.data.groupId) {
            return fail(koa, '缺少 groupId', next)
          }
          let result = await bot.internal.getGroupMsgHistory(data.data.groupId);
          console.log(result);
          //   {
          //     "success": true,
          //     "message": "发送成功",
          //     "data": {
          //         "messages": [
          //             {
          //                 "post_type": "message_sent",
          //                 "message_type": "group",
          //                 "time": 1683702598,
          //                 "self_id": 3174308134,
          //                 "sub_type": "normal",
          //                 "anonymous": null,
          //                 "font": 0,
          //                 "raw_message": "$test 洛阳城里春光好，洛阳才子他乡老。",
          //                 "message_id": -1395799973,
          //                 "group_id": 285911876,
          //                 "message": "$test 洛阳城里春光好，洛阳才子他乡老。",
          //                 "message_seq": 125986,
          //                 "sender": {
          //                     "age": 0,
          //                     "area": "",
          //                     "card": "",
          //                     "level": "",
          //                     "nickname": "咔咔（丁真版）",
          //                     "role": "member",
          //                     "sex": "unknown",
          //                     "title": "",
          //                     "user_id": 3174308134
          //                 },
          //                 "user_id": 3174308134
          //             },
          //             {
          //                 "post_type": "message",
          //                 "message_type": "group",
          //                 "time": 1683702601,
          //                 "self_id": 3174308134,
          //                 "sub_type": "normal",
          //                 "anonymous": null,
          //                 "sender": {
          //                     "age": 0,
          //                     "area": "",
          //                     "card": "",
          //                     "level": "",
          //                     "nickname": "wofvi",
          //                     "role": "member",
          //                     "sex": "unknown",
          //                     "title": "",
          //                     "user_id": 1523459776
          //                 },
          //                 "user_id": 1523459776,
          //                 "message_id": -607455027,
          //                 "font": 0,
          //                 "group_id": 285911876,
          //                 "message": "$test 洛阳城里春光好，洛阳才子他乡老。",
          //                 "message_seq": 125987,
          //                 "raw_message": "$test 洛阳城里春光好，洛阳才子他乡老。"
          //             }
          //         ]
          //     }
          // }
          return success(koa, '发送成功', result, next)
        }

      }
    } catch (error) {
      console.error("Error occurred:", error);
      return fail(koa, "发生错误"+JSON.stringify(error), next);
    }

    return success(koa, '发送成功', null, next)
  })
}







function fail(koa: any, message: string, next: () => void) {
  koa.body = {
    success: false,
    message,
    data: null
  }
  next()
}

function success(koa: any, message: string, data: any, next: () => void) {
  koa.body = {
    success: true,
    message,
    data: data
  }
  next()
}