const express = require('express');

const router = express.Router();

// Health check - a quick way to see if the API is running
router.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

router.use('/auth', require('./auth.routes'));
router.use('/user', require('./user.routes'));

module.exports = router;
