import express from 'express';
import {
  getAllUsers,
  updateUser,
  toggleUserStatus,
  toggleUserVerification,
  deleteUser,
  createUser,
} from '../controllers/adminController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.put('/users/:id/suspend', toggleUserStatus);
router.put('/users/:id/verify', toggleUserVerification);
router.delete('/users/:id', deleteUser);

export default router;
