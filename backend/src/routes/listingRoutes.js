import express from 'express';
import { uploadProductImages } from '../config/upload.js';
import {
  createListing,
  getListingById,
  getAllListings,
  getListingsByUser,
  deleteListing,
  placeBid,
  toggleBlockListing,
  updateListing,
} from '../controllers/listingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllListings);
router.get('/user/:userId', getListingsByUser);
router.get('/:id', getListingById);

// router.post('/', protect, createListing);
router.post(
  '/',
  protect,
  uploadProductImages,
  createListing
);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);
router.post('/:id/bid', protect, placeBid);

router.patch('/:id/block', protect, toggleBlockListing);

export default router;
