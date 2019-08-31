const Koa = require('koa')

// 创建一个Koa对象表示web app本身
const app = new Koa()

// 用post请求处理URL时，我们会遇到一个问题：post请求通常会发送一个表单，或者JSON，它作为request的body发送
// 我们又需要引入另一个middleware来解析原始request请求，然后，把解析后的参数，绑定到ctx.request.body中
const bodyParser = require('koa-bodyparser')

// 注册中间件
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
})

// 注冊中间件
// 由于middleware的顺序很重要，这个koa-bodyparser必须在router之前被注册到app对象上
app.use(bodyParser())

// 导入controller middleware:
const controller = require('./routes');

// add router middleware:
app.use(controller())

// 在端口3000监听:
app.listen(3000)
console.log('app started at port 3000...')