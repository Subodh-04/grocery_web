const mongoose = require("mongoose");
const URL = process.env.MONGODB_URL;

const connectDb = async () => {
  try {
    await mongoose.connect(URL);
    console.log("Database connected Successfully");
  } catch (error) {
    console.error(error);
    process.exit(0);
  }
};

module.exports = connectDb;
