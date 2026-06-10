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
                        is_verified: true,
                        profile: {
                            select: {
                                farm_location: true
                            }
                        }
                    }
                },
                auction: {
                    include: {
                        bids: {
                            include: {
                                bidder: {
                                    select: {
                                        name: true,
                                        profile: {
                                            select: {
                                                user_id: true
                                            }
                                        }
                                    }
                                }
                            },
                            orderBy: {
                                amount: 'desc'
                            }
                        }
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

// Bidding Controllers
export const placeBid = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, user_id } = req.body;
        const bidder_id = req.user?.user_id ?? user_id;

        if (!bidder_id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid bid amount' });
        }

        const result = await prisma.$transaction(async (tx) => {
            const auction = await tx.auction.findUnique({
                where: { listing_id: id },
                include: { listing: true }
            });

            if (!auction) {
                throw new Error('Auction not found for this listing');
            }

            if (auction.status !== 'LIVE') {
                throw new Error('Auction is not live');
            }

            const now = new Date();
            if (now < auction.start_time || now > auction.end_time) {
                throw new Error('Auction has expired or not started yet');
            }

            if (auction.listing.user_id === bidder_id) {
                throw new Error('Seller cannot bid on their own listing');
            }

            const currentHighest = auction.current_highest_bid || auction.starting_bid;
            if (numericAmount <= currentHighest) {
                throw new Error(`Bid amount must be greater than current highest bid (${currentHighest})`);
            }

            // Create bid
            const bid = await tx.bid.create({
                data: {
                    auction_id: auction.auction_id,
                    bidder_id: bidder_id,
                    amount: numericAmount,
                    status: 'ACTIVE'
                }
            });

            // Update auction
            await tx.auction.update({
                where: { auction_id: auction.auction_id },
                data: { current_highest_bid: numericAmount }
            });

            // Update previous bids to OUTBID
            await tx.bid.updateMany({
                where: {
                    auction_id: auction.auction_id,
                    bid_id: { not: bid.bid_id },
                    status: 'ACTIVE'
                },
                data: { status: 'OUTBID' }
            });

            return bid;
        });

        res.status(201).json({ success: true, message: 'Bid placed successfully', data: result });
    } catch (error) {
        console.error('❌ PLACE BID ERROR:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getBidsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const bids = await prisma.bid.findMany({
            where: {
                bidder_id: userId
            },
            include: {
                auction: {
                    include: {
                        listing: true,
                        // bids: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        res.json({
            success: true,
            data: bids
        });

    } catch (error) {
        console.error('❌ GET USER BIDS ERROR:', error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};