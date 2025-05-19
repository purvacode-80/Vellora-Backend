const user_controller = require('../Controller/user_controller');
const authMiddleware = require('../Configuration/auth');
const userValidators = require('../Middleware/user_validators');

const express = require('express');
const route = express.Router();

route.get('/all', authMiddleware, user_controller.getUsers);
route.post('/register', userValidators, user_controller.registerUser);
route.post('/login', user_controller.loginUser);

route.get('/profile', authMiddleware, user_controller.getUserProfile);
route.put('/profile', authMiddleware, user_controller.updateUserProfile);

module.exports = route;
