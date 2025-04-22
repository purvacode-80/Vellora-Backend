const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  addTask,
  updateTask
} = require('../Controller/task_controller');

router.get('/all', getAllTasks);
router.post('/addtask', addTask);
router.put('/:id', updateTask);

module.exports = router;
