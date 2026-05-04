const mongoose = require('mongoose');

async function connectDB(mongoURI) {
  await mongoose.connect(mongoURI);
}

module.exports = connectDB;
