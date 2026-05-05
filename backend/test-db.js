const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

console.log('Testing connection to:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log('SUCCESS: Connected to MongoDB Atlas');
  process.exit(0);
})
.catch(err => {
  console.error('FAILURE: Could not connect to MongoDB Atlas');
  console.error(err);
  process.exit(1);
});
