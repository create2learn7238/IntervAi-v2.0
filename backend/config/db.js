const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/intervai';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed database if empty
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database] Database is empty. Running auto-seeder for 25 student profiles and demo sessions...');
      const { runSeed } = require('../services/seedService');
      await runSeed();
      console.log('[Database] Auto-seeding completed successfully!');
    }
  } catch (error) {
    console.error(`[Database] Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
