 const Task = require('../Model/task_model');

const getAllTasks = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const tasks = await Task.find({ createdBy : userEmail }); // 🔍 Filter by user
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
};

const addTask = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { taskname, description, duedate, contact, status, assignedto, priority } = req.body;

    const newtask = new Task({ taskname, description, duedate, contact, status, assignedto, priority, createdBy: userEmail});

    await newtask.save();
    res.status(201).json(newtask);
  } catch (err) {
    res.status(400).json({ message: 'Error adding task', error: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const taskId = req.params.id;

    const task = await Task.findOneAndUpdate(
      { _id: taskId, createdBy : userEmail }, // ✅ match by ID & user
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (err) {
    res.status(400).json({ message: 'Error updating task', error: err.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const taskId = req.params.id;
    const task = await Task.findOne({ _id: taskId, createdBy : userEmail }); // ✅ secure fetch

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching task', error: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const taskId = req.params.id;
    const deletedTask = await Task.findOneAndDelete({ _id: taskId, createdBy : userEmail });

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task', error: err.message });
  }
};

module.exports = { getAllTasks, addTask, updateTask, deleteTask, getTaskById };
