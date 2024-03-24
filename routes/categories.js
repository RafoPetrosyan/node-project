const express = require('express')
const CategoriesController = require('../controllers/CategoriesController')
const authorization = require('../middlewares/authorization')

const router = express.Router()

router.get('/', authorization, CategoriesController.categoriesList)
router.get('/sub', authorization, CategoriesController.subCategoriesList)

module.exports = router
