require("dotenv").config();

const mongoose = require("mongoose");

async function testConnection() {
    try {
        console.log("Testing MongoDB Atlas connection...");

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "movietime",
            serverSelectionTimeoutMS: 15000
        });

        console.log("SUCCESS: MongoDB connected!");

    } catch (error) {
        console.error("CONNECTION FAILED:");
        console.error(error.message);

    } finally {
        await mongoose.disconnect().catch(() => {});
    }
}

testConnection();