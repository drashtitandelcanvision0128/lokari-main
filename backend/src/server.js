// const express = require("express"); // type: commonjs
import express from 'express'; // type: module
import { config } from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB, disconnectDB, prisma } from './config/db.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Import Routes
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import listingRoutes from './routes/listingRoutes.js';

config();

// Run Prisma migrations on startup (only in production)
const runMigrations = async () => {
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('Running Prisma migrations...');
      await execAsync('npx prisma migrate deploy');
      console.log('Migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error.message);
      // Don't exit, let the server start anyway
    }
  }
};

await runMigrations();
connectDB();

const app = express();

// Middlewares — FRONTEND_URL can be comma-separated for staging + prod
const allowedOrigins = [
  ...(process.env.FRONTEND_URL?.split(',').map((o) => o.trim()) ?? []),
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

console.log('CORS allowed origins:', allowedOrigins.join(', ') || '(none — set FRONTEND_URL)');

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} origin=${req.headers.origin ?? '-'}`);
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin / curl / server-to-server
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json()); // to parse JSON body
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded data

// API Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/listings', listingRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections (e.g. database connection error)
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shtting down gracefully');
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
