const express = require('express')
const UsersController = require('../controllers/UsersController')
const CategoriesController = require('../controllers/CategoriesController')
const adminAuthorization = require('../middlewares/adminAuthorization')
const upload = require('../middlewares/upload')
const { imageMimTypes } = require('../constants/index')

const router = express.Router()

router.get('/users', adminAuthorization, UsersController.usersList)
router.post('/sign-in', UsersController.adminSignIn)

router.get('/categories', adminAuthorization, CategoriesController.adminCategoriesList)
router.get('/sub-categories', adminAuthorization, CategoriesController.adminSubCategoriesList)
router.get('/category/:id', adminAuthorization, CategoriesController.getCategoryById)
router.get('/sub-category/:id', adminAuthorization, CategoriesController.getSubCategoryById)
router.post(
   '/category',
   adminAuthorization,
   upload(imageMimTypes).single('image'),
   CategoriesController.createCategory,
)
router.put(
   '/category/update/:id',
   adminAuthorization,
   upload(imageMimTypes).single('image'),
   CategoriesController.updateCategory,
)
router.delete('/category/delete/:id', adminAuthorization, CategoriesController.deleteCategory)

router.post(
   '/sub-category',
   adminAuthorization,
   upload(imageMimTypes).single('image'),
   CategoriesController.createSubCategory,
)
router.put(
   '/sub-category/update/:id',
   adminAuthorization,
   upload(imageMimTypes).single('image'),
   CategoriesController.updateSubCategory,
)
router.delete(
   '/sub-category/delete/:id',
   adminAuthorization,
   CategoriesController.deleteSubCategory,
)

module.exports = router
