const { body, validationResult } = require('express-validator');

// Validation rules for creating/updating an event
const validateEvent = [
  body('title')
    .notEmpty().withMessage('Event title is required')
    .isLength({ max: 50 }).withMessage('Title should not exceed 50 characters'),

  body('start')
    .notEmpty().withMessage('Start date/time is required')
    .isISO8601().withMessage('Start date must be a valid ISO date'),

  body('end')
    .notEmpty().withMessage('End date/time is required')
    .isISO8601().withMessage('End date must be a valid ISO date'),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description should not exceed 500 characters'),

  // Middleware to validate results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
        .status(400)
        .json({ message: 'Validation failed', errors: errors.array() });
    }
    next();
}
];

module.exports = validateEvent;