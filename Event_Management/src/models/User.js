const mongoose = require('mongoose');

// The shape of a user document in MongoDB.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // MongoDB will reject a second account with the same email
      lowercase: true, // store "John@Mail.com" as "john@mail.com"
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // never return the password hash unless we ask for it
    },
    isVerified: {
      type: Boolean,
      default: false, // every new user starts unverified
    },
    // We store a HASH of the email verification token, not the token itself.
    // If the database ever leaks, the stored value can't be used to verify accounts.
    verificationTokenHash: {
      type: String,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model('User', userSchema);
