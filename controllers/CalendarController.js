const Joi = require('joi')
const moment = require('moment')
const HttpError = require('http-errors')
const { Sequelize } = require('sequelize')
const validate = require('../validations/validate')
const { checkValidTime } = require('../helpers/index')
const Calendar = require('../db/models/calendar')
const Users = require('../db/models/user')

class CategoriesController {
   static getMyCalendarList = async (req, res, next) => {
      try {
         const { userId } = req

         const data = await Calendar.findAll({
            where: { user_id: userId },
            attributes: {
               exclude: ['user_id'],
            },
         })

         res.json({
            status: 'ok',
            data,
         })
      } catch (e) {
         next(e)
      }
   }

   static getList = async (req, res, next) => {
      try {
         const { userId } = req
         let { page, limit } = req.query
         limit = +limit || 10
         page = +page || 1

         const user = await Users.findByPk(userId)
         if (!user) {
            throw HttpError(404, 'User not found')
         }

         const data = await Calendar.findAll({
            include: [
               {
                  model: Users,
                  as: 'user',
                  attributes: [],
                  raw: true,
                  nest: true,
                  subQuery: false,
                  distinct: true,
                  duplicating: false,
               },
            ],
            attributes: [
               'id',
               'day',
               'start_time',
               'end_time',
               'user_id',
               [Sequelize.col('user.first_name'), 'first_name'],
               [Sequelize.col('user.last_name'), 'last_name'],
               [Sequelize.col('user.avatar'), 'avatar'],
            ],
            limit: limit,
            offset: (page - 1) * limit,
         })

         const total_count = await Calendar.count()

         res.json({
            status: 'ok',
            data,
            total_count,
         })
      } catch (e) {
         next(e)
      }
   }

   static addFreeTime = async (req, res, next) => {
      try {
         const { userId } = req
         const { day, times } = req.body
         const timesArray = times?.split(',')?.map((e) => e.trim())

         const schema = Joi.object({
            day: Joi.date()
               .default(() => moment().format('YYYY-MM-DD'))
               .required(),
            times: Joi.array().items(Joi.string()),
         })
         await validate({ schema, values: { day, times: timesArray } })

         const isValidDay = moment(day, 'YYYY-MM-DD').isValid()
         const isStartTime = checkValidTime(timesArray[0])
         const isEndTime = checkValidTime(timesArray[1])

         ;[isValidDay, isEndTime, isStartTime].forEach((item) => {
            if (!item) {
               throw HttpError(422, 'Wrong date format or invalid date')
            }
         })

         const data = await Calendar.create({
            day,
            start_time: timesArray[0],
            end_time: timesArray[1],
            user_id: userId,
         })

         res.json({
            status: 'ok',
            data,
         })
      } catch (e) {
         next(e)
      }
   }

   static deleteFreeTime = async (req, res, next) => {
      try {
         const { id } = req.params
         const data = await Calendar.findByPk(id)

         if (!data) {
            throw HttpError(404, 'Date not found')
         }
         await Calendar.destroy({ where: { id } })

         res.json({
            status: 'ok',
         })
      } catch (e) {
         next(e)
      }
   }
}

module.exports = CategoriesController
