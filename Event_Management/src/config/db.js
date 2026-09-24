const mongoose = require('mongoose');
const config = require('./env');

/** Connects to MongoDB. Exits the process if the initial connection fails. */
async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
