import express from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import listingRoutes from './listingRoutes.js';

const router = express.Router();

/** GET /api — API root / discovery */
router.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Lokhari API',
    status: 'ok',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      admin: '/api/admin',
      listings: '/api/listings',
    },
  });
});

/** GET /api/health — health check under API prefix */
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/listings', listingRoutes);

export default router;
