const { body, validationResult} = require('express-validator')

const user_validators = [
    body('fullName').notEmpty().withMessage('Name is Required')
    .isString().withMessage('Name must be a string'),
    body('email').notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be a valid email address'),
    body('phone_no').notEmpty().withMessage('Phone Number is required')
    .isNumeric().withMessage('Phone Number must be a number')
    .isLength({ min : 10, max : 10}).withMessage('Phone Number must be 10 digits long'),
    body('password').notEmpty().withMessage('Password is required')
    .isLength({ min : 8}).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    //Middleware to validate results
    (req,res,next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
]

module.exports = user_validators