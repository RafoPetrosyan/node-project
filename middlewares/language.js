const HttpError = require('http-errors')
const { languages } = require('../constants')

module.exports = function language(req, res, next) {
   try {
      let lang = 'en'
      if (req.headers.language) {
         if (!languages.includes(req.headers.language)) {
            throw HttpError(422, 'Incorrect language')
         }
         lang = req.headers.language
      }

      req.lang = lang
      next()
   } catch (e) {
      next(e)
   }
}
