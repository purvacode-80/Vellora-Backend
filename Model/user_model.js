const mongoose = require('mongoose');

const userDetails = mongoose.Schema({
    fullName : {
        type: String,
        required: true,
        trim : true
    },
    email : {
        type: String,
        required: true,
        trim : true,
        unique: true
    },
    phone_no : {
        type: Number,
        length: 10,
        required: true
    },
    password : {
        type: String,
        required: true,
    },
    role: {
    type: String,
    default: 'user',
  },
})

module.exports = mongoose.model('users', userDetails)