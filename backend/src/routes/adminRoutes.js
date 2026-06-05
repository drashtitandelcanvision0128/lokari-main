import express from "express";
import { getAllUsers, updateUser, toggleUserStatus, toggleUserVerification, deleteUser, createUser } from "../controllers/adminController.js";

const router = express.Router();

// Get all users
router.get("/users", getAllUsers);

// Create user
router.post("/users", createUser);

// Update a user
router.put("/users/:id", updateUser);

// Toggle user status (suspend/activate)
router.put("/users/:id/suspend", toggleUserStatus);

// Toggle user verification
router.put("/users/:id/verify", toggleUserVerification);

// Delete user (soft delete)
router.delete("/users/:id", deleteUser);

export default router;
