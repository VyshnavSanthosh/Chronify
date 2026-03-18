import mongoose from "mongoose";
import { mongoUri } from './index.js';

async function connectDB() {
    try {
        await mongoose.connect(mongoUri);
        console.log("✔ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Error:", err.message);
        process.exit(1); // stop server
    }
}

export default connectDB;