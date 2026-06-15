import express from 'express';
import {
  createListing,
  getListingById,
  getAllListings,
  getListingsByUser,
  deleteListing,
  placeBid,
} from '../controllers/listingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllListings);
router.get('/user/:userId', getListingsByUser);
router.get('/:id', getListingById);

router.post('/', protect, createListing);
router.delete('/:id', protect, deleteListing);
router.post('/:id/bid', protect, placeBid);

export default router;
