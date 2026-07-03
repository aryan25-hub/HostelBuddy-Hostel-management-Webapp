const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoURI) {
  console.error(
    "MongoDB connection failed: MONGO_URI or MONGODB_URI is not defined in environment",
  );
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connection SUCCESS");
  } catch (error) {
    console.error("MongoDB connection FAIL:", error.message || error);
    process.exit(1);
  }
};

module.exports = connectDB;
