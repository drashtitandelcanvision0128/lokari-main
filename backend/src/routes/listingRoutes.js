import express from 'express';
import { uploadProductImages } from '../config/upload.js';
import { updateListingDetails } from '../controllers/listingController.js';
import {
  createListing,
  getListingById,
  getAllListings,
  getListingsByUser,
  deleteListing,
  placeBid,
  toggleBlockListing,
  updateListing,
  updateListingVerificationController,
} from '../controllers/listingController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import { updateListingImages } from '../controllers/listingController.js';
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
router.put('/:id/details', protect, updateListingDetails);

router.put(
  '/:id/images',
  protect,
  (req, res, next) => {
    console.log("🔥 MULTER HIT");
    uploadProductImages(req, res, (err) => {
      if (err) {
        console.log("MULTER ERROR:", err);
        return next(err);
      }
      console.log("FILES AFTER MULTER:", req.files);
      console.log("BODY AFTER MULTER:", req.body);
      next();
    });
  },
  updateListingImages
);
router.delete('/:id', protect, deleteListing);
router.post('/:id/bid', protect, placeBid);

router.patch('/:id/block', protect, toggleBlockListing);
router.patch(
  '/:id/verification',
  protect,
  requireAdmin,
  updateListingVerificationController
);


export default router;
