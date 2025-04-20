const jwt = require('jsonwebtoken');
const JWT_SECRET = "Purva@2006"

//Middleware to verify token

const verifyToken = (req,res,next) => {
    const token = req.headers['authorization'];

    if(!token) { 
        return res.status(401).send('Access Denied. No token provided.');
    }

    //If token is provided check if it is valid
    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""),JWT_SECRET);
        //Set user as authorized
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(400).json({message: "Invalid token"})
    }
}

module.exports = verifyToken;