const express = require('express');
const protect = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { getProfile } = require('../controllers/user.controller');

const router = express.Router();

// `protect` runs first; getProfile only runs if the token is valid
router.get('/profile', asyncHandler(protect), asyncHandler(getProfile));

module.exports = router;
