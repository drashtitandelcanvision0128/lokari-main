import { prisma } from '../config/db.js';

export const createListingService = async (body) => {
    const {
        user_id, type, title, description,
        price, price_type, status,
        crop_type, variety, quantity, unit,
        min_order_quantity, min_order_unit,
        harvest_date, expiry_date, quality_grade,
        storage_temperature, storage_humidity,
        starting_bid, auction_end,
        // flat address fields sent directly by the frontend form
        street, city, state, pincode, country,
        // nested address object (legacy / admin usage)
        address: addressObj,
        images,
    } = body;

    // Resolve address from either flat fields or nested object
    const resolvedAddress = city
        ? { street: street ?? null, city, state, pincode, country: country ?? 'India' }
        : addressObj ?? null;

    const result = await prisma.$transaction(async (tx) => {
        const listing = await tx.marketplace.create({
            data: {
                user_id,
                type,
                title,
                description,
                price: price ? Number(price) : (starting_bid ? Number(starting_bid) : 0),
                price_type: price_type ?? 'FIXED_PRICE',
                // status: status ?? 'ACTIVE',
                status: status ?? 'DRAFT',
                verification_status: 'PENDING',

                ...(type === 'PRODUCE' && {
                    farmerProduce: {
                        create: {
                            crop_type: crop_type ?? 'Unknown',
                            variety: variety ?? null,
                            quantity: quantity ? Number(quantity) : 0,
                            unit: unit ?? 'Kg',
                            harvest_date: harvest_date ? new Date(harvest_date) : null,
                            expiry_date: expiry_date ? new Date(expiry_date) : null,
                            quality_grade: quality_grade ?? null,
                            min_order_quantity: min_order_quantity ? Number(min_order_quantity) : null,
                            min_order_unit: min_order_unit ?? null,
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
                address: true,
            },
        });

        if (resolvedAddress) {
            await tx.marketplaceAddress.create({
                data: {
                    listing_id: listing.listing_id,
                    street: resolvedAddress.street ?? null,
                    city: resolvedAddress.city,
                    state: resolvedAddress.state,
                    pincode: resolvedAddress.pincode ?? '',
                    country: resolvedAddress.country ?? 'India',
                    lat: resolvedAddress.lat ?? null,
                    lng: resolvedAddress.lng ?? null,
                },
            });
        }

        if (price_type === 'AUCTION') {
            // auction_end comes as YYYY-MM-DD; use end of that day (23:59:59 IST → UTC)
            let endTime;
            if (auction_end) {
                endTime = new Date(auction_end);
                endTime.setHours(23, 59, 59, 999);
            } else {
                endTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            }

            const auction = await tx.auction.create({
                data: {
                    listing_id: listing.listing_id,
                    start_time: new Date(),
                    end_time: endTime,
                    starting_bid: starting_bid ? Number(starting_bid) : 0,
                    reserve_price: null,
                    current_highest_bid: starting_bid ? Number(starting_bid) : 0,
                    status: 'LIVE',
                },
            });
            listing.auction = auction;
        }

        if (images?.length) {
            await tx.marketplace.update({
                where: { listing_id: listing.listing_id },
                data: {
                    product_images: images.map(
                        (file) => `/uploads/productsImgs/${file.filename}`
                    ),
                },
            });
        }

        return listing;
    });

    return result;
};
