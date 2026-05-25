// const express = require("express"); // type: commonjs
import express from "express"; // type: module
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB, disconnectDB } from "./config/db.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";

config();
connectDB();

const app = express();

// Middlewares
app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json()); // to parse JSON body
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded data

// API Routes
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// Handle unhandled promise rejections (e.g. database connection error)
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    server.close(async () => {
        await disconnectDB();
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    server.close(async () => {
        await disconnectDB();
        process.exit(1);
    });
});

// Graceful Shutdown
process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shtting down gracefully");
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
});