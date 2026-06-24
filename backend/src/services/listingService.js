import { prisma } from '../config/db.js';

export const createListingService = async (body) => {
    const {
        user_id, type, title, description, address,
        price, price_type, crop_type, variety, quantity, unit,
        harvest_date, expiry_date, quality_grade,
        storage_temperature, storage_humidity,
        starting_bid, reserve_price, auction_start, auction_end, images
    } = body;

    const result = await prisma.$transaction(async (tx) => {
        const listing = await tx.marketplace.create({
            data: {
                user_id,
                type,
                title,
                description,
                // listing_location,
                price,
                price_type,
                status: 'ACTIVE',

                ...(type === 'PRODUCE' && {
                    farmerProduce: {
                        create: {
                            crop_type: crop_type ?? 'Unknown',
                            variety: variety ?? null,
                            quantity: quantity ?? 0,
                            unit: unit ?? 'kg',
                            harvest_date: harvest_date ? new Date(harvest_date) : null,
                            expiry_date: expiry_date ? new Date(expiry_date) : null,
                            quality_grade: quality_grade ?? null,
                            storage_temperature: storage_temperature ?? null,
                            storage_humidity: storage_humidity ?? null,
                        },
                    },
                }),

                ...(type === 'WAREHOUSE' && {
                    warehouse: {
                        create: {
                            capacity: body.capacity ?? 0,
                            capacity_unit: body.capacity_unit ?? 'tons',
                            available_from: body.available_from ? new Date(body.available_from) : null,
                            available_to: body.available_to ? new Date(body.available_to) : null,
                        },
                    },
                }),

                ...(type === 'TRANSPORT' && {
                    transport: {
                        create: {
                            vehicle_type: body.vehicle_type ?? 'Unknown',
                            capacity: body.capacity ?? 0,
                            capacity_unit: body.capacity_unit ?? 'tons',
                            available_from: body.available_from ? new Date(body.available_from) : null,
                            available_to: body.available_to ? new Date(body.available_to) : null,
                        },
                    },
                }),
            },
            include: {
                farmerProduce: true,
                warehouse: true,
                transport: true,
                address: true
            },
        });

        if (address) {
            await tx.marketplaceAddress.create({
                data: {
                    listing_id: listing.listing_id,

                    street: address.street,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                    country: address.country,

                    lat: address.lat,
                    lng: address.lng,
                }
            });
        }

        if (price_type === 'AUCTION') {
            const auction = await tx.auction.create({
                data: {
                    listing_id: listing.listing_id,
                    start_time: auction_start ? new Date(auction_start) : new Date(),
                    end_time: auction_end ? new Date(auction_end) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    starting_bid: starting_bid ? Number(starting_bid) : 0,
                    reserve_price: reserve_price ? Number(reserve_price) : null,
                    current_highest_bid: starting_bid ? Number(starting_bid) : 0,
                    status: 'LIVE',
                }
            });
            listing.auction = auction;
        }

        if (images?.length) {
            await tx.marketplace.update({
                where: {
                    listing_id: listing.listing_id
                },
                data: {
                    product_images: images.map(
                        file => `/uploads/productsImgs/${file.filename}`
                    )
                }
            });
        }

        return listing;
    });

    return result;
};