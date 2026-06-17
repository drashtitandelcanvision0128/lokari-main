import express from 'express';
import {
  createListing,
  getListingById,
  getAllListings,
  getListingsByUser,
  deleteListing,
  placeBid,
  toggleBlockListing,
} from '../controllers/listingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllListings);
router.get('/user/:userId', getListingsByUser);
router.get('/:id', getListingById);

router.post('/', protect, createListing);
router.delete('/:id', protect, deleteListing);
router.post('/:id/bid', protect, placeBid);

router.patch('/:id/block', protect, toggleBlockListing);

export default router;
