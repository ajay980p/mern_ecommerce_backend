require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const db = await mongoose.connect(process.env.MONGO_CONNECT_URL);
        console.log("db connected");
    } catch (err) {
        console.error("Database Error:", err);
    }
}

connectDB();

module.exports = connectDB;