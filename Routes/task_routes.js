const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  addTask,
  updateTask,
  getTaskById,
  deleteTask
} = require('../Controller/task_controller');
const verifyToken = require('../Configuration/auth'); // ✅ your auth middleware
const validateTask = require('../Middleware/task_validators'); // ✅ your task validation middleware

router.get('/all', verifyToken, getAllTasks);
router.post('/addtask', verifyToken, validateTask, addTask);
router.put('/:id', verifyToken, updateTask);
router.get('/:id', verifyToken, getTaskById);
router.delete('/:id', verifyToken, deleteTask);

module.exports = router;
