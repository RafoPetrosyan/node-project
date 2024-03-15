module.exports = function cors(req, res, next) {
   try {
      if (process.env.ALLOW_ORIGINS.split(',').includes(req.headers.origin)) {
         res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
         res.setHeader('Access-Control-Allow-Headers', 'Authorization,origin,content-type')
         res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,PATCH,DELETE')
         // res.setHeader('Access-Control-Allow-Credentials', 'true');
      }

      next()
   } catch (e) {
      next(e)
   }
}
