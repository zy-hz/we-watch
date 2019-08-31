var fn_hello = async (ctx, next) => {
    var name = ctx.params.name
    ctx.response.body = `<h1>page-filter, ${name}!</h1>`
}

module.exports = {
    'GET /page-filter/:name': fn_hello
}