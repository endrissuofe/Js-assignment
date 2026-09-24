const express = require('express');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { registerSchema, loginSchema, resendSchema } = require('../validators/auth.validator');
const {
  register,
  verifyEmail,
  resendVerification,
  login,
} = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', validate(registerSchema), asyncHandler(register));
router.get('/verify-email', asyncHandler(verifyEmail));
router.post('/resend-verification', validate(resendSchema), asyncHandler(resendVerification));
router.post('/login', validate(loginSchema), asyncHandler(login));

module.exports = router;
