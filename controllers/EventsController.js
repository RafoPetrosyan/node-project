import Joi from 'joi'
import { Op, Sequelize } from 'sequelize'
import moment from 'moment'
import HttpError from 'http-errors'
import path from 'path'
import sharp from 'sharp'
import _ from 'lodash'
import validate from '../validations/validate.js'
import Calendar from '../models/Calendar.js'
import Categories from '../models/Categories.js'
import Users from '../models/Users.js'
import Events from '../models/Events.js'
import EventImages from '../models/EventImages.js'
import UserPreferences from '../models/UserPreferences.js'
import SubCategories from '../models/SubCategories.js'
import { deleteImage } from '../helpers/index.js'

const { BASE_URL } = process.env

class EventsController {
   static getEventByIdHandler = async (id) => {
      return await Events.findByPk(id, {
         include: [
            {
               model: Users,
               as: 'speaker',
               attributes: ['first_name', 'last_name', 'avatar', 'email', 'phone_number'],
            },
            {
               model: EventImages,
               as: 'images',
               separate: true,
               attributes: ['id', 'original', 'thumb', 'is_cover'],
               order: [['is_cover', 'DESC']],
            },
         ],
         attributes: ['id', 'longitude', 'latitude', 'name', 'details', 'start_date', 'end_date'],
      })
   }

   static createEvent = async (req, res, next) => {
      try {
         const { userId, files } = req
         const {
            start_date,
            end_date,
            speaker_id,
            category_id,
            longitude,
            latitude,
            name,
            details,
         } = req.body

         const schema = Joi.object({
            start_date: Joi.date()
               .default(() => moment().format('YYYY-MM-DD HH:mm'))
               .required(),
            end_date: Joi.date()
               .default(() => moment().format('YYYY-MM-DD HH:mm'))
               .required(),
            longitude: Joi.string().required(),
            latitude: Joi.string().required(),
            name: Joi.string().required(),
            details: Joi.string().required(),
            category_id: Joi.string().required(),
            speaker_id: Joi.string().required(),
            cover_image: Joi.any().required(),
         })
         await validate({
            schema,
            values: {
               start_date,
               end_date,
               speaker_id,
               category_id,
               longitude,
               latitude,
               name,
               details,
               cover_image: files?.cover_image,
            },
         })

         const isValidStartDate = moment(start_date, 'YYYY-MM-DD HH:mm').isValid()
         const isValidEndDate = moment(end_date, 'YYYY-MM-DD HH:mm').isValid()

         if (!isValidStartDate && !isValidEndDate) {
            throw HttpError(422, 'Wrong date format or invalid date')
         }

         const currentUser = await Users.findByPk(userId)
         if (!currentUser) throw HttpError(401, 'Unauthorized request')

         const category = await Categories.findByPk(category_id)
         if (!category) throw HttpError(404, 'Category not found')

         const speaker = await Calendar.findByPk(speaker_id)
         if (!speaker) throw HttpError(404, 'Speaker not found')

         const creationEvent = await Events.create({
            start_date,
            end_date,
            speaker_id: speaker.user_id,
            user_id: userId,
            category_id,
            longitude,
            latitude,
            name,
            details,
         })

         const imagesData = []
         if (files.cover_image[0]) {
            const original = path
               .join('/uploads/images', files.cover_image[0].filename)
               .replace(/\\/g, '/')
            const thumb = path
               .join('/uploads/images', `thumb-${files.cover_image[0].filename}`)
               .replace(/\\/g, '/')
            await Promise.all([
               sharp(files.cover_image[0].path)
                  .resize(256)
                  .jpeg({
                     quality: 95,
                     mozjpeg: true,
                  })
                  .toFile(path.resolve(path.join('./public', original))),
               sharp(files.cover_image[0].path)
                  .resize(180)
                  .jpeg({
                     quality: 70,
                     mozjpeg: true,
                  })
                  .toFile(path.resolve(path.join('./public', thumb))),
            ])
            imagesData.push({
               event_id: creationEvent.id,
               original: original,
               thumb: thumb,
               is_cover: true,
            })
         }

         if (!_.isEmpty(files['images[]'])) {
            const images = files['images[]']
            for (let i = 0; i < images.length; i++) {
               const original = path.join('/uploads/images', images[i].filename).replace(/\\/g, '/')
               const thumb = path
                  .join('/uploads/images', `thumb-${images[i].filename}`)
                  .replace(/\\/g, '/')
               await Promise.all([
                  sharp(images[i].path)
                     .resize(256)
                     .jpeg({
                        quality: 95,
                        mozjpeg: true,
                     })
                     .toFile(path.resolve(path.join('./public', original))),
                  sharp(images[i].path)
                     .resize(180)
                     .jpeg({
                        quality: 70,
                        mozjpeg: true,
                     })
                     .toFile(path.resolve(path.join('./public', thumb))),
               ])
               imagesData.push({
                  event_id: creationEvent.id,
                  original: original,
                  thumb: thumb,
               })
            }
         }

         await EventImages.bulkCreate(imagesData)
         const data = await this.getEventByIdHandler(creationEvent.id)

         res.json({
            status: 'ok',
            data,
         })
      } catch (e) {
         next(e)
      }
   }

   static updateEvent = async (req, res, next) => {
      try {
         const { userId, files, params } = req
         const {
            start_date,
            end_date,
            speaker_id,
            category_id,
            longitude,
            latitude,
            name,
            details,
            delete_image_ids,
         } = req.body

         const schema = Joi.object({
            start_date: Joi.date().default(() => moment().format('YYYY-MM-DD HH:mm')),
            end_date: Joi.date().default(() => moment().format('YYYY-MM-DD HH:mm')),
            longitude: Joi.string(),
            latitude: Joi.string(),
            name: Joi.string(),
            details: Joi.string(),
            category_id: Joi.string(),
            speaker_id: Joi.string(),
            delete_image_ids: Joi.string(),
         })
         await validate({
            schema,
            values: {
               start_date,
               end_date,
               speaker_id,
               category_id,
               longitude,
               latitude,
               name,
               details,
            },
         })

         const updateData = { name, details, longitude, latitude }

         if (start_date) {
            const isValidStartDate = moment(start_date, 'YYYY-MM-DD HH:mm').isValid()
            if (!isValidStartDate) {
               throw HttpError(422, 'Wrong date format or invalid date')
            }
            updateData.start_date = start_date
         }

         if (end_date) {
            const isValidEndDate = moment(end_date, 'YYYY-MM-DD HH:mm').isValid()
            if (!isValidEndDate) {
               throw HttpError(422, 'Wrong date format or invalid date')
            }
            updateData.end_date = end_date
         }

         const event = await Events.findByPk(params.id)
         if (!event) throw HttpError(404, 'Event not found')

         const currentUser = await Users.findByPk(userId)
         if (!currentUser && event.user_id !== userId) throw HttpError(403, 'Forbidden request')

         if (category_id) {
            const category = await Categories.findByPk(category_id)
            if (!category) throw HttpError(404, 'Category not found')
            updateData.category_id = category_id
         }

         if (speaker_id) {
            const speaker = await Calendar.findByPk(speaker_id)
            if (!speaker) throw HttpError(404, 'Speaker not found')
            updateData.speaker_id = speaker.user_id
         }

         if (delete_image_ids) {
            const splitData = delete_image_ids.split(',')
            const checkData = splitData.every((value) => !isNaN(Number(value.trim())))

            if (!checkData) {
               throw HttpError(422, 'Invalid image ids')
            }

            const arrayOfIntegers = splitData.map(Number)

            const eventImages = await EventImages.findAll({
               where: {
                  id: {
                     [Op.or]: arrayOfIntegers,
                  },
                  event_id: params.id,
               },
            })
            const destroyIds = []
            for (let i = 0; i < eventImages.length; i++) {
               if (!eventImages[i].is_cover) {
                  destroyIds.push(eventImages[i].id)
                  await deleteImage(eventImages[i].original)
                  await deleteImage(eventImages[i].thumb)
               }
            }
            await EventImages.destroy({ where: { id: destroyIds } })
         }

         await Events.update(updateData, { where: { id: params.id } })

         const imagesData = []
         if (files.cover_image?.[0]) {
            const coverImage = await EventImages.findOne({
               where: {
                  event_id: params.id,
                  is_cover: true,
               },
            })
            await deleteImage(coverImage.original)
            await deleteImage(coverImage.thumb)

            const original = path
               .join('/uploads/images', files.cover_image[0].filename)
               .replace(/\\/g, '/')
            const thumb = path
               .join('/uploads/images', `thumb-${files.cover_image[0].filename}`)
               .replace(/\\/g, '/')
            await Promise.all([
               sharp(files.cover_image[0].path)
                  .resize(256)
                  .jpeg({
                     quality: 95,
                     mozjpeg: true,
                  })
                  .toFile(path.resolve(path.join('./public', original))),
               sharp(files.cover_image[0].path)
                  .resize(180)
                  .jpeg({
                     quality: 70,
                     mozjpeg: true,
                  })
                  .toFile(path.resolve(path.join('./public', thumb))),
            ])
            await EventImages.update(
               {
                  original: original,
                  thumb: thumb,
               },
               { where: { id: coverImage.id } },
            )
         }

         if (!_.isEmpty(files['images[]'])) {
            const images = files['images[]']
            for (let i = 0; i < images.length; i++) {
               const original = path.join('/uploads/images', images[i].filename).replace(/\\/g, '/')
               const thumb = path
                  .join('/uploads/images', `thumb-${images[i].filename}`)
                  .replace(/\\/g, '/')
               await Promise.all([
                  sharp(images[i].path)
                     .resize(256)
                     .jpeg({
                        quality: 95,
                        mozjpeg: true,
                     })
                     .toFile(path.resolve(path.join('./public', original))),
                  sharp(images[i].path)
                     .resize(180)
                     .jpeg({
                        quality: 70,
                        mozjpeg: true,
                     })
                     .toFile(path.resolve(path.join('./public', thumb))),
               ])
               imagesData.push({
                  event_id: params.id,
                  original: original,
                  thumb: thumb,
               })
            }
         }

         if (!_.isEmpty(imagesData)) {
            await EventImages.bulkCreate(imagesData)
         }

         const data = await this.getEventByIdHandler(params.id)

         res.json({
            status: 'ok',
            data,
         })
      } catch (e) {
         next(e)
      }
   }

   static getEvents = async (req, res, next) => {
      try {
         const { userId } = req
         let { page = 1, search, limit } = req.query
         limit = +limit || 10
         page = +page || 1

         const userPreferences = await UserPreferences.findAll({
            include: [
               {
                  model: SubCategories,
                  as: 'sub_category',
                  attributes: [],
               },
            ],
            attributes: [[Sequelize.col('sub_category.category_id'), 'category_id']],
            where: {
               user_id: userId,
            },
         })

         const categoryIds = userPreferences.reduce((acc, item) => {
            if (!acc.includes(item.dataValues.category_id)) {
               acc.push(item.dataValues.category_id)
            }
            return acc
         }, [])

         const where = {}
         if (search) {
            where[Op.or] = [
               { name: { [Op.like]: `%${search}%` } },
               { details: { [Op.like]: `%${search}%` } },
            ]
         }

         const queryObj = {
            where,
            include: [
               {
                  model: EventImages,
                  as: 'images',
                  attributes: [],
                  where: { is_cover: true },
                  raw: true,
                  nest: true,
                  subQuery: false,
                  distinct: true,
                  duplicating: false,
               },
            ],
            attributes: [
               'id',
               'name',
               'details',
               'start_date',
               'end_date',
               [Sequelize.literal(`CONCAT('${BASE_URL}', images.thumb)`), 'image'],
            ],
            limit: limit,
            offset: (page - 1) * limit,
         }

         if (!_.isEmpty(categoryIds)) {
            queryObj.order = [
               [
                  Sequelize.literal(
                     `CASE WHEN category_id IN (${categoryIds.join(',')}) THEN 0 ELSE 1 END`,
                  ),
                  'ASC',
               ],
               ['category_id', 'ASC'],
            ]
         }

         const total_count = await Events.count({ where })
         const data = await Events.findAll(queryObj)

         res.json({
            status: 'ok',
            data,
            total_count,
         })
      } catch (e) {
         next(e)
      }
   }

   static getEventById = async (req, res, next) => {
      try {
         const { params } = req
         const data = await this.getEventByIdHandler(params.id)

         res.json({
            status: 'ok',
            data,
         })
      } catch (e) {
         next(e)
      }
   }

   static deleteEvent = async (req, res, next) => {
      try {
         const { userId, params } = req
         const event = await Events.findByPk(params.id, {
            include: [
               {
                  model: EventImages,
                  as: 'images',
               },
            ],
         })

         if (!event) {
            throw HttpError(404, 'Event not found')
         }

         if (event.user_id !== userId) {
            throw HttpError(403, 'Forbidden request')
         }

         for (let i = 0; i < event.images.length; i++) {
            await deleteImage(event.images[i].original)
            await deleteImage(event.images[i].thumb)
         }

         await Events.destroy({
            where: {
               id: params.id,
            },
         })

         res.json({
            status: 'ok',
         })
      } catch (e) {
         next(e)
      }
   }
}

export default EventsController
