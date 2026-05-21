// const express = require("express"); // type: commonjs
import express from "express"; // type: module
import { config } from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";

config();
connectDB();

const app = express();

//Body parsing middlewares
app.use(express.json()); // to parse JSON body
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded data

//API Routes
app.use("/auth", authRoutes);



const PORT = 5000;
app.listen(PORT, () => {
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