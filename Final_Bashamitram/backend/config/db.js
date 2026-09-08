const mongoose = require("mongoose");
mongoose.set('bufferCommands', false);

const connectDB = async (dbName = "BHASHAMITHRAM") => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "Missing MongoDB connection string. Set MONGO_URI (or MONGODB_URI) in .env"
    );
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(
      `✅ MongoDB Connected: ${connection.connection.host} | DB: ${connection.connection.name}`
    );

    return connection;
  } catch (error) {
    const isSrvLookupIssue =
      error.message?.includes("querySrv") ||
      error.code === "ENOTFOUND" ||
      error.code === "ECONNREFUSED";

    console.error(
      "❌ MongoDB Connection Error:",
      error.message
    );

    if (isSrvLookupIssue) {
      console.error(
        "ℹ️ SRV DNS lookup failed. If your network blocks SRV queries, use the non-SRV Atlas URI (mongodb://...) from Atlas Connect."
      );
    }

    throw error;
  }
};

module.exports = connectDB;

/*const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "Missing MongoDB connection string. Set MONGO_URI (or MONGODB_URI) in .env"
    );
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(
      `✅ MongoDB Connected: ${connection.connection.host} | DB: ${connection.connection.name}`
    );

    return connection;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    throw error;
  }
};

module.exports = connectDB;*/