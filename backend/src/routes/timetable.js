const express = require('express');
const { body } = require('express-validator');
const timetableController = require('../controllers/timetableController');
const { auth, checkPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const generateTimetableValidation = [
  body('name')
    .notEmpty()
    .trim()
    .withMessage('Timetable name is required'),
  body('department')
    .notEmpty()
    .trim()
    .withMessage('Department is required'),
  body('semester')
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),
  body('academicYear')
    .notEmpty()
    .trim()
    .withMessage('Academic year is required'),
  body('batch.name')
    .notEmpty()
    .trim()
    .withMessage('Batch name is required'),
  body('batch.strength')
    .isInt({ min: 1 })
    .withMessage('Batch strength must be a positive number'),
  body('subjectIds')
    .isArray({ min: 1 })
    .withMessage('At least one subject must be selected')
];

const updateTimetableValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('status')
    .optional()
    .isIn(['draft', 'generated', 'review', 'approved', 'published', 'archived'])
    .withMessage('Invalid status')
];

const approvalValidation = [
  body('approved')
    .isBoolean()
    .withMessage('Approved field must be true or false'),
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comments cannot exceed 500 characters')
];

// Routes
router.get('/', auth, timetableController.getAllTimetables);
router.get('/analytics', auth, checkPermission('canViewReports'), timetableController.getTimetableAnalytics);
router.get('/:id', auth, timetableController.getTimetableById);

router.post('/generate', 
  auth, 
  checkPermission('canCreateTimetable'),
  generateTimetableValidation, 
  validate, 
  timetableController.generateTimetable
);

router.post('/generate-options', 
  auth, 
  checkPermission('canCreateTimetable'),
  generateTimetableValidation, 
  validate, 
  timetableController.generateMultipleOptions
);

router.put('/:id', 
  auth, 
  updateTimetableValidation, 
  validate, 
  timetableController.updateTimetable
);

router.post('/:id/approve', 
  auth, 
  checkPermission('canApproveTimetable'),
  approvalValidation, 
  validate, 
  timetableController.approveTimetable
);

router.post('/:id/publish', 
  auth, 
  checkPermission('canApproveTimetable'),
  timetableController.publishTimetable
);

router.delete('/:id', auth, timetableController.deleteTimetable);

module.exports = router;
