import { prisma } from '../config/db.js';
import { createListingService } from '../services/listingService.js';

export const createListing = async (req, res) => {
    try {
        // console.log('FILES:', req.files); // To check if the req.files has product_images 
        // console.log('BODY:', req.body);

        // const listingData = JSON.parse(req.body.data);
        // const user_id = req.user.user_id;
        // const data = await createListingService({ ...req.body, user_id });
        const listingData = JSON.parse(req.body.data);
        const user_id = req.user.user_id;

        const data = await createListingService({
            ...listingData,
            user_id,
            // images: req.files
            images: req.files?.['product_images'] || []
        });
        res.status(201).json({ success: true, message: 'Listing created', data });
    } catch (error) {
        console.error('❌ CONTROLLER ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getListingById = async (req, res) => {
    try {
        const { id } = req.params;

        const listing = await prisma.marketplace.findUnique({
            where: { listing_id: id },
            include: {
                address: true,
                farmerProduce: true,
                warehouse: true,
                transport: true,
                user: {
                    select: {
                        name: true,
                        is_verified: true,
                        profile: {
                            select: {
                                farm_location: true,
                                warehouse_location: true,
                            },
                        },
                    },
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
                            orderBy: { amount: 'desc' }
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
        const {
            page = 1,
            limit = 10,
            search = '',
            status = 'all',
            sortField = 'created_at',
            sortDirection = 'desc',
            marketplace = 'false'
        } = req.query;


        const cleanSearch = search.trim();
        const cleanStatus = status.trim();
        const cleanDirection = sortDirection.trim();

        const where = {
            is_deleted: false,
        };

        if (marketplace === 'true') {
            where.status = 'ACTIVE';
            where.is_blocked = false;
        } else if (cleanStatus !== 'all') {
            where.status = cleanStatus;
        }

        if (cleanSearch) {
            where.title = {
                contains: cleanSearch,
                mode: 'insensitive'
            }
        }



        const sortMap = {
            product: 'title',
            price: 'price',
            // listingLocation: 'listing_location'
        };

        const dbSortField = sortMap[sortField] || 'created_at';
        const listings = await prisma.marketplace.findMany({
            // where: { is_deleted: false },
            where,
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: {
                [dbSortField]: cleanDirection === 'asc' ? 'asc' : 'desc'
            },
            include: {
                address: true,
                farmerProduce: true,
                warehouse: true,
                transport: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        is_verified: true,
                        addresses: {
                            orderBy: { is_default: 'desc' },
                            select: {
                                city: true,
                                state: true,
                            },
                            take: 1,
                        },
                        profile: {
                            select: {
                                farm_location: true,
                                warehouse_location: true,
                                service_area: true,
                            }
                        }
                    }
                }
            },
            // orderBy: { created_at: 'desc' }
            orderBy: {
                [dbSortField]: sortDirection
            }
        });
        const total = await prisma.marketplace.count({
            where
        });

        // res.json({ success: true, data: listings });
        res.json({
            success: true,
            data: listings,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page)
        });
    } catch (error) {
        console.error('❌ GET ALL LISTINGS ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getListingsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const listings = await prisma.marketplace.findMany({
            where: {
                user_id: userId,
                is_deleted: false,
            },
            include: {
                farmerProduce: true,
                warehouse: true,
                transport: true,
            },
            // orderBy: { created_at: 'desc' },
            orderBy: {
                [dbSortField]: sortDirection
            }
        });

        res.json({ success: true, data: listings });
    } catch (error) {
        console.error('❌ GET USER LISTINGS ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteListing = async (req, res) => {
    const { id } = req.params

    try {
        await prisma.marketplace.update({
            where: { listing_id: id },
            data: { is_deleted: true }
        })

        res.json({ success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, error: err.message })
    }
}

export const toggleBlockListing = async (req, res) => {
    const { id } = req.params

    try {
        const listing = await prisma.marketplace.findUnique({
            where: { listing_id: id },
            select: { is_blocked: true }
        })

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' })
        }

        const updated = await prisma.marketplace.update({
            where: { listing_id: id },
            data: { is_blocked: !listing.is_blocked },
        })

        res.json({ success: true, data: updated })
    } catch (err) {
        console.error('❌ BLOCK TOGGLE ERROR:', err)
        res.status(500).json({ success: false, message: err.message })
    }
}

export const updateListing = async (req, res) => {
    const { id } = req.params;
    const {
        title,
        description,
        price,
        address,
        quantity,
        status
    } = req.body;

    console.log("ADDRESS RECEIVED:", address);

    try {
        const listing = await prisma.marketplace.findUnique({
            where: { listing_id: id },
            include: {
                address: true
            }
        });



        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        const statusMap = {
            ACTIVE: "ACTIVE",
            DRAFT: "DRAFT",
            SOLD: "SOLD",
            EXPIRED: "EXPIRED",
        };

        if (status !== undefined) {
            updateData.status = statusMap[status];
        }
        console.log("FINAL UPDATE DATA:", updateData);
        const updatedListing = await prisma.marketplace.update({
            where: { listing_id: id },
            data: updateData
        });

        if (address && listing.address) {
            await prisma.marketplaceAddress.update({
                where: {
                    listing_id: id
                },
                data: {
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                    country: address.country
                }
            });
        }

        if (quantity !== undefined) {
            await prisma.farmerProduce.update({
                where: {
                    listing_id: id
                },
                data: {
                    quantity: Number(quantity)
                }
            });
        }

        res.json({ success: true, data: updatedListing });
    } catch (err) {
        console.error('❌ UPDATE LISTING ERROR:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateListingImages = async (req, res) => {
    const { id } = req.params;

    // console.log("======== IMAGE UPDATE =========")
    // console.log("BODY:", req.body)
    // console.log("FILES:", req.files)
    try {

        const listing = await prisma.marketplace.findUnique({
            where: {
                listing_id: id
            }
        });


        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found"
            });
        }


        const existingImages = JSON.parse(
            req.body.existingImages || "[]"
        );

        const replacedIndices = JSON.parse(req.body.replacedIndices || "[]");


        const newFiles = req.files?.['product_images'] || [];
        const replacedFiles = req.files?.['replaced_images'] || [];


        // Slot each replaced file back into its original position
        replacedIndices.forEach((slotIndex, fileArrayIndex) => {
            const file = replacedFiles[fileArrayIndex];
            if (file) {
                existingImages[slotIndex] = `/uploads/productsImgs/${file.filename}`;
            }
        });

        // Append brand-new images at the end
        newFiles.forEach(file => {
            existingImages.push(`/uploads/productsImgs/${file.filename}`);
        });



        // const finalImages = [
        //     ...existingImages,
        //     ...newImages
        // ];

        // Safety net: drop any slots that never got a file
        const finalImages = existingImages.filter(img => img !== '__replaced__');


        const updated = await prisma.marketplace.update({
            where: {
                listing_id: id
            },
            data: {
                product_images: finalImages
            }
        });


        res.json({
            success: true,
            data: updated
        });


    } catch (error) {

        console.error(
            "UPDATE IMAGES ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const placeBid = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const bidder_id = req.user.user_id;

        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid bid amount' });
        }

        const result = await prisma.$transaction(async (tx) => {
            const auction = await tx.auction.findUnique({
                where: { listing_id: id },
                include: { listing: true }
            });

            if (!auction) throw new Error('Auction not found for this listing');
            if (auction.status !== 'LIVE') throw new Error('Auction is not live');

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

            const bid = await tx.bid.create({
                data: {
                    auction_id: auction.auction_id,
                    bidder_id,
                    amount: numericAmount,
                    status: 'ACTIVE'
                }
            });

            await tx.auction.update({
                where: { auction_id: auction.auction_id },
                data: { current_highest_bid: numericAmount }
            });

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
            where: { bidder_id: userId },
            include: {
                auction: {
                    include: { listing: true }
                }
            },
            // orderBy: { created_at: 'desc' }
            orderBy: {
                [dbSortField]: sortDirection
            }
        });

        res.json({ success: true, data: bids });
    } catch (error) {
        console.error('❌ GET USER BIDS ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};