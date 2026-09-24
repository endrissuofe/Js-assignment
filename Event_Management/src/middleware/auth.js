const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * Protects a route: only lets the request through if it carries a valid JWT
 * belonging to an existing, verified user.
 *
 * The client must send the token in this header:
 *   Authorization: Bearer <token>
 */
async function protect(req, res, next) {
  // 1. Read the token from the Authorization header
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Not logged in. Please provide a token.'));
  }
  const token = header.split(' ')[1];

  // 2. Check the token's signature and expiry
  let payload;
  try {
    // Only accept the algorithm we sign with (blocks "algorithm swap" tricks)
    payload = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Your session has expired. Please log in again.'
      : 'Invalid token. Please log in again.';
    return next(new ApiError(401, message));
  }

  // 3. Make sure the user still exists (they may have been deleted)
  const user = await User.findById(payload.id);
  if (!user) {
    return next(new ApiError(401, 'The user for this token no longer exists'));
  }

  // 4. Unverified users can't use protected routes
  if (!user.isVerified) {
    return next(new ApiError(403, 'Please verify your email to access this resource'));
  }

  // 5. Attach the user to the request so controllers can use it
  req.user = user;
  next();
}

module.exports = protect;
