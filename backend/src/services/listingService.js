// services/listingService.js
import { prisma } from '../config/db.js';

export const createListingService = async (body) => {
    const {
        user_id,
        type,
        title,
        description,
        price,
        price_type,
        crop_type,
        quantity,
        unit,
        harvest_date,
        expiry_date,
        quality_grade,
    } = body;

    const listing = await prisma.listing.create({
        data: {
            user_id,
            type,           // must be "PRODUCE" | "WAREHOUSE" | "TRANSPORT"
            title,
            description,
            price,
            price_type,
            status: 'ACTIVE',

            // Nested create for the sub-listing type
            ...(type === 'PRODUCE' && {
                produceListing: {
                    create: {
                        crop_type: crop_type ?? 'Unknown',
                        quantity: quantity ?? 0,
                        unit: unit ?? 'kg',
                        harvest_date: harvest_date ? new Date(harvest_date) : null,
                        expiry_date: expiry_date ? new Date(expiry_date) : null,
                        quality_grade: quality_grade ?? null,
                    },
                },
            }),

            ...(type === 'WAREHOUSE' && {
                warehouseListing: {
                    create: {
                        capacity: body.capacity ?? 0,
                        capacity_unit: body.capacity_unit ?? 'tons',
                        available_from: body.available_from ? new Date(body.available_from) : null,
                        available_to: body.available_to ? new Date(body.available_to) : null,
                    },
                },
            }),

            ...(type === 'TRANSPORT' && {
                transportListing: {
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
            produceListing: true,
            warehouseListing: true,
            transportListing: true,
        },
    });

    return listing;
};