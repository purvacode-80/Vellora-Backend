const user_controller = require('../Controller/user_controller');
const authMiddleware = require('../Configuration/auth');
const userValidators = require('../Middleware/user_validators');

const express = require('express')
const verifyToken = require('../Configuration/auth')
const route = express.Router()

route.get('/all', authMiddleware, user_controller.getUsers)
route.post('/register', userValidators, user_controller.registerUser)
route.post('/login', user_controller.loginUser)
route.post('/userexists', user_controller.userExists)
route.get('/profile', verifyToken, user_controller.getProfileInfo)
route.put('/update', verifyToken, user_controller.updateUser)

module.exports = route;
