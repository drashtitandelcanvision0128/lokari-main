import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from './config/db.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { runMigrations } from './config/migrate.js';
import { createCorsMiddleware } from './config/cors.js';
import { requestLogger } from './middleware/requestLogger.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';
import apiRoutes from './routes/apiRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import listingRoutes from './routes/listingRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(requestLogger);
app.use(createCorsMiddleware());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', apiRoutes);

// Legacy paths — same routers
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/listings', listingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

function registerShutdownHandlers(server) {
  let shuttingDown = false;

  const shutdown = async (signal, exitCode = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      await disconnectDB();
      await disconnectRedis();
      process.exit(exitCode);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Log only — exiting here kills the server on any stray async error
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection (server kept running):', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    shutdown('uncaughtException', 1);
  });
}

async function startServer() {
  try {
    await runMigrations();
  } catch (err) {
    console.error('Startup aborted: database migration failed');
    throw err;
  }

  try {
    await connectDB();
  } catch (err) {
    console.error('Startup aborted: could not connect to database');
    console.error('Check DATABASE_URL is reachable from this environment');
    throw err;
  }

  await connectRedis();

  const port = process.env.PORT || 5000;
  const server = app.listen(port);

  server.on('listening', () => {
    console.log(`Server is running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use.`);
      console.error(
        'Stop the other process (e.g. docker stop lokhari-backend) or run with PORT=5005 npm start',
      );
    } else {
      console.error(`Failed to start server on port ${port}:`, err.message);
    }
    process.exit(1);
  });

  registerShutdownHandlers(server);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err?.message ?? err);
  process.exit(1);
});

export default app;
