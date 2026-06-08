import { prisma } from '../config/db.js';
import { createListingService } from '../services/listingService.js';

export const createListing = async (req, res) => {
    try {
        const user_id = req.user?.user_id ?? req.body.user_id;

        if (!user_id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const data = await createListingService({ ...req.body, user_id });

        res.status(201).json({ success: true, message: 'Listing created', data });

    } catch (error) {
        console.error('❌ CONTROLLER ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getListingById = async (req, res) => {
    try {
        const { id } = req.params;

        const listing = await prisma.listing.findUnique({
            where: { listing_id: id },
            include: {
                produceListing: true,
                warehouseListing: true,
                transportListing: true,
                user: {
                    select: {
                        name: true,
                        is_verified: true
                    }
                }
            }
        });

        if (!listing || listing.is_deleted) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        res.json({ success: true, data: listing });

    } catch (error) {
        console.error('❌ GET LISTING ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllListings = async (req, res) => {
    try {
        const listings = await prisma.listing.findMany({
            where: { is_deleted: false },
            include: {
                produceListing: true,
                warehouseListing: true,
                transportListing: true,
                user: {
                    select: {
                        name: true,
                        is_verified: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json({ success: true, data: listings });

    } catch (error) {
        console.error('❌ GET ALL LISTINGS ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getListingsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const listings = await prisma.listing.findMany({
            where: {
                user_id: userId,
                is_deleted: false,
            },
            include: {
                produceListing: true,
                warehouseListing: true,
                transportListing: true,
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        res.json({
            success: true,
            data: listings,
        });

    } catch (error) {
        console.error('❌ GET USER LISTINGS ERROR:', error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Data Manipulation Through UI
export const deleteListing = async (req, res) => {
    const { id } = req.params

    try {
        await prisma.listing.update({
            where: {
                listing_id: id
            },
            data: {
                is_deleted: true
            }
        })

        res.json({
            success: true
        })

    } catch (err) {
        console.error(err)

        res.status(500).json({
            success: false,
            error: err.message
        })
    }
}