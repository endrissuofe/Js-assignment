const express = require('express');

const router = express.Router();

// Health check - handy for the frontend team and for deployment probes.
router.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

// Phase 2+: auth and user routes get mounted here
// router.use('/auth', require('./auth.routes'));
// router.use('/user', require('./user.routes'));

module.exports = router;
