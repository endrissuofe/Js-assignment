/**
 * GET /api/user/profile
 * Returns the logged-in user's profile.
 * `req.user` was attached by the auth middleware.
 */
async function getProfile(req, res) {
  const { _id, name, email, isVerified, createdAt } = req.user;

  res.json({
    success: true,
    user: { id: _id, name, email, isVerified, createdAt },
  });
}

module.exports = { getProfile };
