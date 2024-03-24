const express = require('express')
const CalendarController = require('../controllers/CalendarController')
const authorization = require('../middlewares/authorization')

const router = express.Router()

router.get('/my-list', authorization, CalendarController.getMyCalendarList)
router.get('/', authorization, CalendarController.getList)
router.post('/', authorization, CalendarController.addFreeTime)
router.delete('/:id', authorization, CalendarController.deleteFreeTime)

module.exports = router
