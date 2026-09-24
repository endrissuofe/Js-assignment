const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');
const { createVerificationToken } = require('../utils/token');
const { sendVerificationEmail } = require('../utils/sendEmail');

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

  // 2. Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Create the verification token and its expiry time
  const { token, tokenHash } = createVerificationToken();
  const expiresAt = new Date(Date.now() + config.verificationTokenTtlMinutes * 60 * 1000);

  // 4. Save the user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    verificationTokenHash: tokenHash,
    verificationTokenExpires: expiresAt,
  });

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

module.exports = { register };
