const path = require('path')
const ejs = require('ejs')
const { v4: uniqueId } = require('uuid');
const fs = require('fs')
const locales = require('../locales/index')
const { sendMail } = require('../services/nodemailer')
const { mimTypesList } = require('../constants/index')

const { BASE_URL } = process.env

const translate = (message, language) => locales[language][message]

const generateRandomCode = () => {
   let code = ''
   for (let i = 0; i < 6; i++) {
      code += Math.floor(Math.random() * 10)
   }
   return code
}

const emailVerification = async (email, verificationCode) => {
   const htmlDirection = path.resolve(path.join('./templates', 'emailVerification.ejs'))
   const html = await ejs.renderFile(htmlDirection, { verificationCode })
   const subject = 'Verify your account'
   await sendMail({ email, subject, html })
}

const generateImagePath = (mimetype) => {
   return `${new Date().toISOString().replace(/:/g, '-')}-${uniqueId()}${mimTypesList[mimetype]}`
}

const deleteImage = async (image) => {
   if (!image) return
   const imageUrl = path.resolve(path.join('./public', image.replace(BASE_URL, '')))
   await fs.unlink(imageUrl, (err) => {
      if (err) throw err
      console.log('successfully')
   })
}

const checkValidTime = (time) =>
    /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(time)


module.exports = {
   checkValidTime,
   deleteImage,
   generateImagePath,
   emailVerification,
   generateRandomCode,
   translate,
}