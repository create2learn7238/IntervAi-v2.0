require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const { runSeed } = require('./services/seedService');

async function seedData() {
  const directAtlasUri = 'mongodb://learn7238_db_user:Au38YeIjTN8D9kDN@ac-7sq8lon-shard-00-00.ul2jk4n.mongodb.net:27017,ac-7sq8lon-shard-00-01.ul2jk4n.mongodb.net:27017,ac-7sq8lon-shard-00-02.ul2jk4n.mongodb.net:27017/intervAi?ssl=true&replicaSet=atlas-13ms4t-shard-0&authSource=admin&retryWrites=true&w=majority';

  const connectionUris = [
    directAtlasUri,
    process.env.MONGODB_URI,
    process.env.MONGO_URI,
    'mongodb://127.0.0.1:27017/intervai'
  ].filter(Boolean);

  let connected = false;
  for (const uri of connectionUris) {
    try {
      console.log(`🔌 Connecting to MongoDB...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      console.log(`✅ Connected successfully to: ${uri.includes('127.0.0.1') ? 'Local MongoDB' : 'Atlas Cluster'}`);
      connected = true;
      break;
    } catch (err) {
      console.warn(`⚠️ Connection attempt failed: ${err.message}`);
    }
  }

  if (!connected) {
    console.error('❌ Could not connect to any MongoDB instance.');
    process.exit(1);
  }

  try {
    const result = await runSeed();
    console.log('\n🎉 ALL COLLECTIONS SUCCESSFULLY SEEDED! 🎉');
    console.log('====================================================');
    console.log(`- 👥 Total Users: ${result.usersCount}`);
    console.log(`- 🎙️ Demo Candidate (demo@interai.app): 3 Full Sessions & 12 Perfect Evaluations`);
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seedData();
