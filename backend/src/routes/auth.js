const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .trim()
    .withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('profile.firstName')
    .notEmpty()
    .trim()
    .withMessage('First name is required'),
  body('profile.lastName')
    .notEmpty()
    .trim()
    .withMessage('Last name is required'),
  body('role')
    .optional()
    .isIn(['admin', 'faculty', 'staff', 'student'])
    .withMessage('Invalid role')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Routes
router.post('/login', loginValidation, validate, authController.login);
router.post('/register', registerValidation, validate, authController.register);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.put('/change-password', auth, changePasswordValidation, validate, authController.changePassword);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
