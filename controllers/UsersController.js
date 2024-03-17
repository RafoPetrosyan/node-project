const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const HttpError = require('http-errors')
const Joi = require('joi')
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')
const sharp = require('sharp')
const validate = require('../validations/validate')
const { emailVerification, generateRandomCode, translate } = require('../helpers/index')
const Users = require('../db/models/user')
const SubCategories = require('../db/models/user')
import SubCategories from '../models/SubCategories.js'
import UserPreferences from '../models/UserPreferences.js'
import { signInProviders } from '../constants/index.js'
import { sendMail } from '../services/nodemailer.js'

const { JWT_SECRET, BASE_URL } = process.env

class UsersController {
   /** Users */
   static signIn = async (req, res, next) => {
      try {
         const { email, password } = req.body

         const schema = Joi.object({
            email: Joi.string().required().email(),
            password: Joi.string().required(),
         })

         await validate({ schema, values: { email, password }, lang: req.lang })

         const user = await Users.findOne({
            where: {
               email,
               password: Users.hashPassword(password),
            },
         })

         if (!user) {
            throw HttpError(401, translate('invalidEmailOrPassword', req.lang))
         }

         const token = jwt.sign({ userId: user.id }, JWT_SECRET)

         const response = {
            status: 'ok',
            token,
            user,
         }

         if (!user.verified) {
            const verificationCode = generateRandomCode()
            const verify_token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '5m' })
            await emailVerification(email, verificationCode)

            await Users.update(
               {
                  verification_code: verificationCode,
               },
               {
                  where: {
                     id: user.id,
                  },
               },
            )

            response.verify_token = verify_token
         }

         res.json(response)
      } catch (e) {
         next(e)
      }
   }

   static socialLogin = async (req, res, next) => {
      try {
         const { provider, access_token } = req.body

         if (!provider || !access_token) {
            throw HttpError(422, 'Invalid data')
         }

         if (!signInProviders.includes(provider)) {
            throw HttpError(422, 'Wrong provider')
         }

         let providerData
         switch (provider) {
            case 'google':
               console.log(1111)
               break
            case 'facebook':
               console.log(1111)
         }

         // const user = await Users.findOne({
         //     where: {
         //         email,
         //         password: Users.hashPassword(password),
         //     },
         // });

         // if (!user) {
         //     throw HttpError(401, translate('invalidEmailOrPassword', req.lang));
         // }

         // const token = jwt.sign({userId: user.id}, JWT_SECRET, {
         //     expiresIn: '1h'
         // });

         res.json({
            status: 'ok',
            // token,
            // user,
         })
      } catch (e) {
         next(e)
      }
   }

   static signUp = async (req, res, next) => {
      try {
         const { email, password } = req.body

         const schema = Joi.object({
            email: Joi.string().required().email(),
            password: Joi.string().min(6).max(10).required(),
         })

         await validate({ schema, values: { email, password }, lang: req.lang })

         if (await Users.findOne({ where: { email } })) {
            throw HttpError(422, {
               errors: {
                  email: translate('emailAlreadyExits', req.lang),
               },
            })
         }

         const user = await Users.create({ email, password })

         const verificationCode = generateRandomCode()
         await emailVerification(email, verificationCode)

         await Users.update(
            {
               verification_code: verificationCode,
            },
            {
               where: {
                  id: user.id,
               },
            },
         )

         const token = jwt.sign({ userId: user.id }, JWT_SECRET)
         const verify_token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '5m' })

         res.json({
            status: 'ok',
            user,
            token,
            verify_token,
         })
      } catch (e) {
         next(e)
      }
   }

   static signUpUserInfo = async (req, res, next) => {
      try {
         const { userId } = req
         const user = await Users.findByPk(userId)

         if (!user) {
            throw HttpError(404, 'User not found')
         }

         const { first_name, last_name, phone_number } = req.body

         const schema = Joi.object({
            first_name: Joi.string().required(),
            last_name: Joi.string().required(),
            phone_number: Joi.string().required(),
         })

         await validate({ schema, values: { first_name, last_name, phone_number }, lang: req.lang })

         await Users.update(
            {
               first_name,
               last_name,
               phone_number,
            },
            {
               where: {
                  id: userId,
               },
            },
         )
         const data = await Users.findByPk(userId)

         res.json({
            status: 'ok',
            data,
         })
      } catch (e) {
         next(e)
      }
   }

   static addPreferences = async (req, res, next) => {
      try {
         const { userId } = req
         const { preferences } = req.body
         const user = await Users.findByPk(userId)

         if (!user) {
            throw HttpError(404, 'User not found')
         }

         if (!preferences) {
            throw HttpError(422, 'Invalid data')
         }

         const splitData = preferences.split(',')
         const checkData = splitData.every((value) => !isNaN(Number(value.trim())))

         if (!checkData) {
            throw HttpError(422, 'Invalid data')
         }

         const arrayOfIntegers = splitData.map(Number)

         const data = await SubCategories.findAll({
            where: {
               id: {
                  [Op.or]: arrayOfIntegers,
               },
            },
         })

         if (data.length !== splitData.length) {
            throw HttpError(422, 'Invalid data')
         }

         const insertData = arrayOfIntegers.reduce((acc, item) => {
            acc.push({ user_id: userId, sub_category_id: item })
            return acc
         }, [])

         await UserPreferences.bulkCreate(insertData)

         res.json({
            status: 'ok',
         })
      } catch (e) {
         next(e)
      }
   }

   static confirmVerification = async (req, res, next) => {
      try {
         const { userId } = req
         const { code, verify_token = '' } = req.body

         if (!code || !verify_token) {
            throw HttpError(422, 'Invalid data')
         }

         let tokenData
         try {
            tokenData = jwt.verify(verify_token, JWT_SECRET)
         } catch (err) {
            throw HttpError(403, 'Verify token expired')
         }

         if (userId !== tokenData.userId) {
            throw HttpError(401, 'Unauthorized request')
         }

         let user
         user = await Users.findOne({
            where: {
               id: userId,
               verification_code: code,
            },
         })

         if (!user) {
            throw HttpError(422, translate('wrongCode', req.lang))
         }

         await Users.update(
            { verified: true, verification_code: null },
            {
               where: {
                  id: userId,
               },
            },
         )
         user = await Users.findByPk(userId)

         res.json({
            status: 'ok',
            user,
         })
      } catch (e) {
         next(e)
      }
   }

   static resendVerification = async (req, res, next) => {
      try {
         const { userId } = req
         const user = await Users.findByPk(userId)

         if (user.verified) {
            throw HttpError(422, 'User already verified')
         }

         const verificationCode = generateRandomCode()
         await emailVerification(user.email, verificationCode)

         await Users.update(
            {
               verification_code: verificationCode,
            },
            {
               where: {
                  id: user.id,
               },
            },
         )

         const verify_token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1m' })

         res.json({
            status: 'ok',
            verify_token,
         })
      } catch (e) {
         next(e)
      }
   }

   static forgotPassword = async (req, res, next) => {
      try {
         const { email } = req.body

         const schema = Joi.object({
            email: Joi.string().required().email(),
         })
         await validate({ schema, values: { email }, lang: req.lang })

         const user = await Users.findOne({ where: { email } })

         if (!user) {
            throw HttpError(404, 'User not found')
         }

         const verificationCode = generateRandomCode()
         const htmlDirection = path.resolve(path.join('./templates', 'resetPassword.ejs'))
         const html = await ejs.renderFile(htmlDirection, { verificationCode })
         const subject = 'Reset password'
         await sendMail({ email, subject, html })

         await Users.update(
            {
               verification_code: verificationCode,
            },
            {
               where: {
                  id: user.id,
               },
            },
         )

         const reset_token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '5m' })

         res.json({
            status: 'ok',
            reset_token,
         })
      } catch (e) {
         next(e)
      }
   }

   static confirmRestPasswordCode = async (req, res, next) => {
      try {
         const { reset_token, code } = req.body

         const schema = Joi.object({
            code: Joi.string().required(),
            reset_token: Joi.string().required(),
         })
         await validate({ schema, values: { reset_token, code }, lang: req.lang })

         let tokenData
         try {
            tokenData = jwt.verify(reset_token, JWT_SECRET)
         } catch (err) {
            throw HttpError(403, 'Verify token expired')
         }

         const user = await Users.findOne({
            where: {
               id: tokenData.userId,
               verification_code: code,
            },
         })

         if (!user) {
            throw HttpError(422, translate('wrongCode', req.lang))
         }

         await Users.update(
            {
               verification_code: null,
            },
            {
               where: {
                  id: user.id,
               },
            },
         )

         const token = jwt.sign({ userId: user.id }, JWT_SECRET)

         res.json({
            status: 'ok',
            user,
            token,
         })
      } catch (e) {
         next(e)
      }
   }

   static resetPassword = async (req, res, next) => {
      try {
         const { password } = req.body
         const { userId } = req

         const schema = Joi.object({
            password: Joi.string().min(6).max(10).required(),
         })
         await validate({ schema, values: { password }, lang: req.lang })

         const user = await Users.findByPk(userId)

         if (!user) {
            throw HttpError(404, 'User not found')
         }

         await Users.update(
            { password },
            {
               where: {
                  id: userId,
               },
            },
         )

         res.json({
            status: 'ok',
            user,
         })
      } catch (e) {
         next(e)
      }
   }

   static updateProfile = async (req, res, next) => {
      try {
         const { userId, file } = req
         const user = await Users.findByPk(userId)

         if (!user) {
            throw HttpError(404, 'User not found')
         }

         const { first_name, last_name, phone_number } = req.body

         let avatar
         if (file) {
            avatar = path.join('/uploads/images', file.filename).replace(/\\/g, '/')
            await Promise.all([
               sharp(file.path)
                  .resize(256)
                  .jpeg({
                     quality: 85,
                     mozjpeg: true,
                  })
                  .toFile(path.resolve(path.join('./public', avatar))),
            ])
            if (user.avatar) {
               const oldImage = path.resolve(
                  path.join('./public', user.avatar.replace(BASE_URL, '')),
               )
               await fs.unlink(oldImage, (err) => {
                  if (err) throw err
                  console.log('successfully')
               })
            }
         }

         await Users.update(
            {
               first_name,
               last_name,
               phone_number,
               avatar,
            },
            {
               where: {
                  id: userId,
               },
            },
         )
         const data = await Users.findByPk(userId)

         res.json({
            status: 'ok',
            data,
         })
      } catch (e) {
         next(e)
      }
   }

   /** Admins */
   static adminSignIn = async (req, res, next) => {
      try {
         const { email, password } = req.body

         const user = await Users.findOne({
            where: {
               email,
               password: Users.hashPassword(password),
               role: 'admin',
            },
         })

         if (!user) {
            throw HttpError(401, translate('invalidEmailOrPassword', req.lang))
         }

         const token = jwt.sign({ userId: user.id }, JWT_SECRET)

         res.json({
            status: 'ok',
            token,
            user,
         })
      } catch (e) {
         next(e)
      }
   }

   static usersList = async (req, res, next) => {
      try {
         let { page = 1, search, limit } = req.query
         limit = +limit || 10
         page = +page || 1

         const where = {}
         if (search) {
            where[Op.or] = [
               { first_name: { [Op.like]: `%${search}%` } },
               { last_name: { [Op.like]: `%${search}%` } },
               { email: { [Op.like]: `%${search}%` } },
               { phone_number: { [Op.like]: `%${search}%` } },
            ]
         }

         const users = await Users.findAll({
            where,
            limit: limit,
            offset: (page - 1) * limit,
            logging: true,
            attributes: { exclude: ['verification_code'] },
         })

         res.json({
            status: 'ok',
            users,
         })
      } catch (e) {
         next(e)
      }
   }
}

export default UsersController
