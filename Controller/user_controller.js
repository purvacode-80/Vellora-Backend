const User = require('../Modal/user_model')
const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')
const JWT_SECRET = "Purva@2006"

const registerUser = async (req,res) => {
    try {
        const { fullName, email, phone_no , password} = req.body

        // Check if User with given email already exists
        const userExists = await User.findOne({ email })
        if(userExists) {
            return res.status(400).json({ message : "User with this email already exists" })
        }

        //Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new User
        const newUser = new User({ fullName, email, phone_no , password : hashedPassword});
        await newUser.save()
        res.status(201).json({ message : "User registered successfully" })
    } catch (err) {
        res.status(500).json({ message : "Internal Server Error" , error : err.message })
    }
}

const loginUser = async (req,res) => {
    try {
        const {email, password} = req.body

        // Check if User with given email exists
        const user = await User.findOne({ email })
        if(!user) {
            return res.status(404).json({ message : "User not found" })
        }

        const isMatch = bcrypt.compare(password,user.password)
        if(!isMatch) {
            return res.status(401).json({ message : "Incorrect Password" })
        }
        
        const token = jwt.sign({ id: User._id , email : User.email}, JWT_SECRET, {expiresIn: "1h"})
        res.status(200).json({ message : "Login successful", token : token })

    } catch (err) {
        res.status(500).json({ message : "Internal Server Error" , error : err.message })
    }
}

const getUsers = async(req,res) => {
    try {
        const User = await User.find()
        res.status(200).json(User)
    } catch (err) {
        res.status(500).json({ message : "Internal Server Error" , error : err.message })
    }
}

module.exports = { registerUser, loginUser, getUsers}