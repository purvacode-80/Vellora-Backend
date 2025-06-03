const User = require('../Model/user_model')
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
        
        const token = jwt.sign({ id: user._id , email : user.email}, JWT_SECRET, {expiresIn: "30d"})
        res.status(200).json({ message : "Login successful", token : token })

    } catch (err) {
        res.status(500).json({ message : "Internal Server Error" , error : err.message })
    }
}

const getUsers = async(req,res) => {
    try {
        const users = await User.find()
        res.status(200).json(users)
    } catch (err) {
        res.status(500).json({ message : "Internal Server Error" , error : err.message })
    }
}

const userExists = async (req,res) => {
    try {
        const { email } = req.body

        // Check if User with given email exists
        const userExists = await User.findOne({ email })
        if(userExists) {
            return res.status(200).json({exists : true})
        }
        return res.status(200).json({exists : false})
    }
    catch (err) {
        res.status(500).json({ message : "Internal Server Error" , error : err.message })
    }
}

const getProfileInfo = async (req,res) => {
    try {
        const userEmail = req.user.email;
        const user = await User.findOne({ email : userEmail })
        if(!user) {
            return res.status(404).json({ message : "User not found" })
        }
        res.status(200).json({ fullName : user.fullName, email : user.email, phone_no : user.phone_no })
    } catch (err) {
        res.status(500).json({ message : "Internal Server Error" , error : err.message })
    }
}

const updateUser = async (req,res) => {
    try {
        const userEmail = req.user.email;
        const { fullName, phone_no } = req.body

        // Check if User with given email exists
        const user = await User.findOne({ email : userEmail })
        if(!user) {
            return res.status(404).json({ message : "User not found" })
        }

        // Update User
        user.fullName = fullName
        user.phone_no = phone_no
        await user.save()
        
        res.status(200).json({ message : "User updated successfully" })
    } catch (err) {
        res.status(500).json({ message : "Internal Server Error" , error : err.message })
    }
}

module.exports = { registerUser, loginUser, getUsers, userExists, getProfileInfo, updateUser }
