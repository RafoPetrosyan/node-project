const express = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../swagger.json')
const users = require('./users')
const admin = require('./admin')
const categories = require('./categories')
const calendar = require('./calendar')
const events = require('./events')

const router = express.Router()

const swaggerOptions = {
   explorer: false,
   customCss: '.swagger-ui .topbar { display:none}',
   sorter: 'alpha',
   customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui@5.10.3/dist/swagger-ui.min.css',
}

router.get('/', (req, res, next) => {
   res.json({ status: 'ok' })
})

router.use('/users', users)
router.use('/admin', admin)
router.use('/categories', categories)
router.use('/calendar', calendar)
router.use('/events', events)
router.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions))

module.exports = router
