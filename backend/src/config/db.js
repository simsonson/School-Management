const mongoose = require('mongoose');
const dns = require('dns');

// Force Google public DNS — fixes "querySrv ECONNREFUSED" on networks
// where the default DNS resolver can't handle SRV lookups
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async () => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error('MONGODB_URI environment variable is not set!');
      }

      console.log(`MongoDB connection attempt ${retries + 1}/${MAX_RETRIES}...`);

      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        maxPoolSize: 10,
        heartbeatFrequencyMS: 10000,
        family: 4,  // Force IPv4 — avoids IPv6 resolution issues
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected. Mongoose will auto-reconnect.');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected.');
      });

      return;
    } catch (error) {
      retries++;
      console.error(`❌ MongoDB connection attempt ${retries} failed: ${error.message}`);

      if (retries < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * Math.pow(2, retries - 1);
        console.log(`   Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error('🚨 All MongoDB connection attempts failed. Exiting.');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;

