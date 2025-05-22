const { body, validationResult } = require('express-validator');

const validateContact = [
  body('fullName').notEmpty().withMessage('Full Name is required'),
  body('email').notEmpty().withMessage('Email is required')
  .isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required')
  .isNumeric().withMessage('Phone number must be numeric')
  .matches(/^\d{10}$/).withMessage('Phone number must be 10 digits'),
  body('status').optional().isIn(['Active', 'Inactive', 'Pending']).withMessage('Invalid status'),

  //Middleware to validate results
  (req,res,next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}
];

module.exports = validateContact;