const { body, validationResult } = require('express-validator');

const validateTask = [
  body('taskname')
    .notEmpty().withMessage('Task name is required')
    .isLength({ min: 3 }).withMessage('Task name must be at least 3 characters'),

  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),

  body('duedate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Due date must be a valid date')
    .custom((value) => {
      const due = new Date(value);
      if (due < new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),

  body('contact')
    .notEmpty().withMessage('Contact number is required')
    .isNumeric().withMessage('Contact must be a number')
    .matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian mobile number'),

  body('assignedto')
    .notEmpty().withMessage('Assigned person is required')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Started', 'Not Started', 'Pending', 'In Progress', 'Completed'])
    .withMessage('Invalid status value'),

  body('priority')
    .notEmpty().withMessage('Priority is required')
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid priority value'),

   // Middleware to validate results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = validateTask;