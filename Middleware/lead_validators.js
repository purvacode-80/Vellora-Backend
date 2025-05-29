const { body, validationResult } = require('express-validator');

const validateLead = [
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('fullName').notEmpty().withMessage('Full Name is required'),
  body('email').notEmpty().withMessage('Email is required')
  .isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required')
  .matches(/^\d{10}$/).withMessage('Phone number must be 10 digits'),
  body('leadSource').optional().isIn(['Referral', 'Website', 'Cold Call', 'Social Media', 'Email Campaign', 'Trade Show', 'Other']).withMessage('Invalid lead source'),
  body('industry').optional().isIn(['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education', 'Real Estate']),
  body('status').optional().isIn(['New', 'In Progress', 'Converted', 'Closed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),

  //Middleware to validate results
  (req,res,next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}
];

module.exports = validateLead
