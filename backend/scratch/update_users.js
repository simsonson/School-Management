const mongoose = require('mongoose');
const User = require('../src/models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const updateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    const result = await User.updateMany(
      { isApproved: { $exists: false } },
      { $set: { isApproved: true } }
    );

    console.log(`Updated ${result.modifiedCount} users.`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updateUsers();
