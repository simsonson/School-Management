const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.message.includes('querySrv ECONNREFUSED')) {
      console.warn('WARNING: Could not resolve MongoDB Atlas SRV record. Please check your DNS settings or use a standard connection string.');
    }
    // We don't exit(1) here to allow the server to start for other modules, 
    // though DB-dependent features will fail.
  }
};

module.exports = connectDB;
