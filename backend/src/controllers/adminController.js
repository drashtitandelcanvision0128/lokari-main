import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";

// Helper to map DB user and profile to frontend AdminUser interface format
const mapDbUserToAdminUser = (user, profile) => {
    const roleMappingReverse = {
        FARMER: "farmer",
        TRADER: "trader",
        WAREHOUSE_OWNER: "warehouse",
        TRANSPORTER: "transporter"
    };

    let location = undefined;
    if (user.role === "FARMER") location = profile?.farm_location;
    else if (user.role === "WAREHOUSE_OWNER") location = profile?.warehouse_location;
    else if (user.role === "TRANSPORTER") location = profile?.service_area;

    let status = user.is_active ? "active" : "banned";

    return {
        id: user.user_id,
        name: user.name || "Unknown",
        email: user.email,
        role: roleMappingReverse[user.role] || "farmer",
        status: status,
        joinedAt: user.created_at.toISOString(),
        createdAt: user.created_at.toISOString(),
        lastActive: user.updated_at.toISOString(),
        listings: 0, // Placeholder until listings are implemented
        orders: 0,   // Placeholder until orders are implemented
        revenue: "$0", // Placeholder until payments are implemented
        verificationStatus: user.is_verified ? "verified" : "unverified",
        phone: user.phone || undefined,
        location: location || "Not specified"
    };
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                is_deleted: false
            },
            include: {
                profile: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const adminUsers = users.map(u => mapDbUserToAdminUser(u, u.profile));

        res.status(200).json({
            status: "success",
            data: adminUsers
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Server error fetching users" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role, is_active } = req.body;

        const roleMapping = {
            farmer: "FARMER",
            trader: "TRADER",
            warehouse: "WAREHOUSE_OWNER",
            transporter: "TRANSPORTER"
        };

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (role && roleMapping[role]) updateData.role = roleMapping[role];
        if (typeof is_active !== "undefined") updateData.is_active = is_active;

        const updatedUser = await prisma.user.update({
            where: { user_id: id },
            data: updateData,
            include: { profile: true }
        });

        res.status(200).json({
            status: "success",
            data: mapDbUserToAdminUser(updatedUser, updatedUser.profile)
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Server error updating user" });
    }
};

export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await prisma.user.findUnique({ where: { user_id: id } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const updatedUser = await prisma.user.update({
            where: { user_id: id },
            data: { is_active: !user.is_active },
            include: { profile: true }
        });

        res.status(200).json({
            status: "success",
            data: mapDbUserToAdminUser(updatedUser, updatedUser.profile)
        });
    } catch (error) {
        console.error("Error toggling user status:", error);
        res.status(500).json({ error: "Server error toggling user status" });
    }
};

export const toggleUserVerification = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await prisma.user.findUnique({ where: { user_id: id } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const updatedUser = await prisma.user.update({
            where: { user_id: id },
            data: { is_verified: !user.is_verified },
            include: { profile: true }
        });

        res.status(200).json({
            status: "success",
            data: mapDbUserToAdminUser(updatedUser, updatedUser.profile)
        });
    } catch (error) {
        console.error("Error toggling user verification:", error);
        res.status(500).json({ error: "Server error toggling user verification" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({ where: { user_id: id } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Soft delete the user
        await prisma.user.update({
            where: { user_id: id },
            data: { is_deleted: true }
        });

        res.status(200).json({
            status: "success",
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Server error deleting user" });
    }
};

export const createUser = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            password,
            role,
            farmName,
            companyName,
            warehouseName,
            vehicleType,
            location,
            capacity,
            businessType
        } = req.body;

        if (!email || !password || !fullName || !role) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const userExists = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });
        if (userExists) {
            return res.status(400).json({ error: "User already exists with this email" });
        }

        if (phone) {
            const phoneExists = await prisma.user.findUnique({
                where: { phone: phone.trim() },
            });
            if (phoneExists) {
                return res.status(400).json({ error: "User already exists with this phone number" });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const roleMapping = {
            farmer: "FARMER",
            trader: "TRADER",
            warehouse: "WAREHOUSE_OWNER",
            transporter: "TRANSPORTER"
        };
        const dbRole = roleMapping[role?.toLowerCase()] || "FARMER";

        const user = await prisma.user.create({
            data: {
                name: fullName.trim(),
                email: email.toLowerCase().trim(),
                phone: phone ? phone.trim() : null,
                password: hashedPassword,
                role: dbRole,
                is_verified: true, // Auto verify when created by admin
                profile: {
                    create: {
                        farm_name: farmName || null,
                        farm_location: dbRole === "FARMER" ? location : null,
                        company_name: companyName || null,
                        business_type: dbRole === "TRADER" ? businessType : null,
                        warehouse_name: warehouseName || null,
                        warehouse_location: dbRole === "WAREHOUSE_OWNER" ? location : null,
                        capacity: dbRole === "WAREHOUSE_OWNER" ? capacity : null,
                        vehicle_type: dbRole === "TRANSPORTER" ? vehicleType : null,
                        service_area: dbRole === "TRANSPORTER" ? location : null,
                    }
                }
            },
            include: {
                profile: true
            }
        });

        res.status(201).json({
            status: "success",
            data: mapDbUserToAdminUser(user, user.profile),
        });
    } catch (error) {
        console.error("Create user error:", error);
        res.status(500).json({ error: "Server error creating user" });
    }
};
