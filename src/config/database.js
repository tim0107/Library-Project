const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/Library');
    console.log('Connect DB Success');
  } catch (error) {
    console.log('Connect DB Fail');
    console.log(error.message);
  }
}

module.exports = connectDB;
