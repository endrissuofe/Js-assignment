/**
 * Loads and validates environment variables once, so the rest of the app
 * can import a single config object instead of reading process.env directly.
 */
require('dotenv').config();

const required = ['MONGO_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  verificationTokenTtlMinutes: parseInt(process.env.VERIFICATION_TOKEN_EXPIRES_MINUTES, 10) || 60,
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'EventHorizon <no-reply@eventhorizon.dev>',
  },
};
