import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadAvatar } from '../config/upload.js';
import {
  getMyProfile,
  updateMyProfile,
  updateAvatarHandler,
  deleteAvatarHandler,
} from '../controllers/profileController.js';

const router = express.Router();

router.use(protect);

router.get('/me',           getMyProfile);
router.put('/me',           updateMyProfile);
router.put('/me/avatar',    uploadAvatar, updateAvatarHandler);
router.delete('/me/avatar', deleteAvatarHandler);

export default router;
