const express = require('express');
const router = express.Router();
const {
  getEvents,
  addEvent,
  updateEvent,
  deleteEvent,
} = require('../Controller/event_controller'); // Adjust the path as necessary
const validateEvent = require('../Middleware/event_validators'); // ✅ your task validation middleware
const verifyToken = require('../Configuration/auth');

router.get('/', verifyToken, getEvents);
router.post('/', verifyToken, validateEvent, addEvent);
router.put('/:eventId', verifyToken, updateEvent);
router.delete('/:eventId', verifyToken, deleteEvent);

module.exports = router;