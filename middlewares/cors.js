const ALLOW_ORIGINS = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4000']

module.exports = function cors(req, res, next) {
   try {
      if (ALLOW_ORIGINS.includes(req.headers.origin)) {
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
