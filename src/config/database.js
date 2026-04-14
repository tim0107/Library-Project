const mongoose = require('mongoose');

async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error('MONGO_URI is not defined');
    }

    await mongoose.connect(uri);

    console.log('Connect DB Success');
  } catch (error) {
    console.log('Connect DB Fail');
    console.log(error.message);
  }
}

module.exports = connectDB;
