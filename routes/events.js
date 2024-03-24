const express = require('express')
const authorization = require('../middlewares/authorization')
const EventsController = require('../controllers/EventsController')
const upload = require('../middlewares/upload')
const { imageMimTypes } = require('../constants/index')

const router = express.Router()

router.get('/', authorization, EventsController.getEvents)
router.get('/:id', authorization, EventsController.getEventById)
router.post(
   '/',
   authorization,
   upload(imageMimTypes).fields([
      { name: 'cover_image', maxCount: 1 },
      { name: 'images[]', maxCount: 10 },
   ]),
   EventsController.createEvent,
)
router.put(
   '/:id',
   authorization,
   upload(imageMimTypes).fields([
      { name: 'cover_image', maxCount: 1 },
      { name: 'images[]', maxCount: 10 },
   ]),
   EventsController.updateEvent,
)
router.delete('/:id', authorization, EventsController.deleteEvent)

module.exports = router
