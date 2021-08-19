exports.index = (ctx,next) => {
    const req = ctx.request.body;
    const filter_name = (req.module + "_" + req.method.split("_")[0]).toLocaleLowerCase();
    console.log(filter_name);
    return ctx.body = filter_name;
}