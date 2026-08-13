require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Please provide an email address.');
    console.error('Usage: node seedAdmin.js <email>');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/intervai');
    console.log('✅ MongoDB connected');

    const normalizedEmail = email.trim().toLowerCase();
    
    // Find the user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.error(`❌ User not found with email: ${normalizedEmail}`);
      process.exit(1);
    }

    // Update role
    user.role = 'admin';
    await user.save();

    console.log(`🎉 Success! The user ${normalizedEmail} has been promoted to System Admin.`);
    console.log('You can now log in and access the Admin Dashboard to manage other users.');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating user:', err);
    process.exit(1);
  }
};

seedAdmin();
