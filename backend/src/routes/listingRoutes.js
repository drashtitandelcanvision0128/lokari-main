import express from "express";
import { createListing, getListingById, getAllListings, getListingsByUser } from "../controllers/listingController.js";
// import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllListings);         // GET  /listings
router.get("/:id", getListingById);     // GET  /listings/:id
router.get("/user/:userId", getListingsByUser);
router.post("/", createListing);        // POST /listings

export default router;