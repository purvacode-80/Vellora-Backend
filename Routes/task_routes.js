const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  addTask,
  updateTask,
  getTaskById,
  deleteTask
} = require('../Controller/task_controller');

router.get('/all', getAllTasks);
router.post('/addtask', addTask);
router.put('/:id', updateTask);
router.get('/:id', getTaskById);
router.delete('/:id', deleteTask);
module.exports = router;
