const mongoose = require("mongoose");
const {mongoUri} = require('./index');

async function connectDB() {
    try {
        await mongoose.connect(mongoUri);
        console.log("✔ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Error:", err.message);
        process.exit(1); // stop server
    }
}

module.exports = connectDB;