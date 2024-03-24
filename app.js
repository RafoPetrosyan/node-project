require('dotenv').config()

const { HttpError } = require('http-errors')
const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const Debug = require('debug')
const indexRouter = require('./routes/index')
const cors = require('./middlewares/cors')
const language = require('./middlewares/language')

const debug = Debug('app:index')
const app = express()

app.set('trust proxy', 1)
app.use(cors)
app.use(language)
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api', indexRouter)

app.use((req, res, next) => {
   next(HttpError(404))
})

app.use((err, req, res, next) => {
   res.status(err.status || 500)
   res.json({
      status: 'error',
      message: err.message,
      stack: err.stack,
      errors: err.errors,
   })
})

debug('hello')

module.exports = app
