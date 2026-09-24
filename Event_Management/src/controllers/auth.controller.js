const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');
const { createVerificationToken, hashToken } = require('../utils/token');
const { sendVerificationEmail } = require('../utils/sendEmail');

/** Helper: gives a user a fresh verification token (valid for the configured minutes). */
function setNewVerificationToken(user) {
  const { token, tokenHash } = createVerificationToken();
  user.verificationTokenHash = tokenHash;
  user.verificationTokenExpires = new Date(Date.now() + config.verificationTokenTtlMinutes * 60 * 1000);
  return token; // the raw token goes in the email; only the hash is saved
}

/**
 * POST /api/auth/register
 * Creates a new (unverified) user and emails them a verification link.
 */
async function register(req, res) {
  const { name, email, password } = req.body; // already checked by Joi

  // 1. Stop if the email is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  // 2. Hash the password (10 salt rounds is the common default)
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Build the user and give them a verification token
  const user = new User({ name, email, password: hashedPassword });
  const token = setNewVerificationToken(user);

  // 4. Save the user
  await user.save();

  // 5. Send the email. If it fails, remove the user so they can try again.
  try {
    await sendVerificationEmail(user, token);
  } catch (err) {
    await User.deleteOne({ _id: user._id });
    console.error('Email sending failed:', err.message);
    throw new ApiError(500, 'Could not send verification email. Please try again.');
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
    user: { id: user._id, name: user.name, email: user.email, isVerified: user.isVerified },
  });
}

/**
 * GET /api/auth/verify-email?token=xyz
 * Marks the user as verified if the token is correct and not expired.
 */
async function verifyEmail(req, res) {
  const { token } = req.query;
  if (!token) {
    throw new ApiError(400, 'Verification token is missing');
  }

  // We only stored the hash, so hash the incoming token and look for a match
  // that has not expired yet ($gt = "greater than" now).
  const user = await User.findOne({
    verificationTokenHash: hashToken(String(token)),
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Verification link is invalid or has expired');
  }

  // Mark verified and remove the token so the link can't be used again
  user.isVerified = true;
  user.verificationTokenHash = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
}

/**
 * POST /api/auth/resend-verification
 * Sends a new verification link (e.g. when the old one expired).
 */
async function resendVerification(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Only send if the account exists and still needs verifying
  if (user && !user.isVerified) {
    const token = setNewVerificationToken(user);
    await user.save();
    await sendVerificationEmail(user, token);
  }

  // Same reply either way, so nobody can use this endpoint to discover
  // which emails are registered.
  res.json({
    success: true,
    message: 'If that account exists and is not yet verified, a new verification email has been sent.',
  });
}

/**
 * POST /api/auth/login
 * Checks email + password and returns a JWT. Unverified users are blocked.
 */
async function login(req, res) {
  const { email, password } = req.body;

  // Password is hidden by default (select: false), so ask for it explicitly
  const user = await User.findOne({ email }).select('+password');

  // Use one vague message for both cases so attackers can't tell
  // whether the email exists.
  const passwordMatches = user && (await bcrypt.compare(password, user.password));
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isVerified) {
    throw new ApiError(403, 'Please verify your email before logging in');
  }

  // The token only carries the user id. It is signed with our secret,
  // so any change to it will be detected.
  const token = jwt.sign({ id: user._id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
}

module.exports = { register, verifyEmail, resendVerification, login };
