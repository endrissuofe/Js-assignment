const express = require('express');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { registerSchema } = require('../validators/auth.validator');
const { register } = require('../controllers/auth.controller');

const router = express.Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), asyncHandler(register));

module.exports = router;
