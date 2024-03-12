const {HttpError} = require("http-errors");
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

module.exports = app;
