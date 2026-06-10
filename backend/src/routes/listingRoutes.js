import express from "express";
import { createListing, getListingById, getAllListings, getListingsByUser, deleteListing, placeBid } from "../controllers/listingController.js";
// import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllListings);         // GET  /listings
router.get("/:id", getListingById);     // GET  /listings/:id
router.get("/user/:userId", getListingsByUser);
router.post("/", createListing);        // POST /listings

router.delete("/:id", deleteListing)    // DELETE /listings/:id
router.post("/:id/bid", placeBid)       // POST /listings/:id/bid

export default router;