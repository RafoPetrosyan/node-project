const express = require('express')
const UsersController = require('../controllers/UsersController')
const authorization = require('../middlewares/authorization')
const upload = require('../middlewares/upload')
const { imageMimTypes } = require('../constants/index')

const router = express.Router()

router.post('/sign-in', UsersController.signIn)
router.post('/sign-up', UsersController.signUp)
router.post('/confirm-verification', authorization, UsersController.confirmVerification)
router.post('/resend-verification', authorization, UsersController.resendVerification)
router.put('/sign-up/user-info', authorization, UsersController.signUpUserInfo)
router.put('/preferences', authorization, UsersController.addPreferences)
router.post('/forgot-password', UsersController.forgotPassword)
router.post('/forgot-password/code', UsersController.confirmRestPasswordCode)
router.put('/reset-password', authorization, UsersController.resetPassword)
router.put(
   '/update-profile',
   authorization,
   upload(imageMimTypes).single('avatar'),
   UsersController.updateProfile,
)

module.exports = router
