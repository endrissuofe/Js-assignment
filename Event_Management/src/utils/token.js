const crypto = require('crypto');

/**
 * Creates a random email verification token.
 * - `token` is sent to the user in the email link.
 * - `tokenHash` is what we save in the database.
 */
function createVerificationToken() {
  const token = crypto.randomBytes(32).toString('hex'); // 64 random characters
  const tokenHash = hashToken(token);
  return { token, tokenHash };
}

/** Turns a token into a SHA-256 hash, so we can compare it with the one in the database. */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { createVerificationToken, hashToken };
