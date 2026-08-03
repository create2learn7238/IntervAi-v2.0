const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://learn7238_db_user:Au38YeIjTN8D9kDN@cluster0.ul2jk4n.mongodb.net/intervAi?retryWrites=true&w=majority';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
