/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum (idempotent — may already exist from a previously failed run)
DO $$ BEGIN
    CREATE TYPE "ListingType" AS ENUM ('PRODUCE', 'WAREHOUSE', 'TRANSPORT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SOLD', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "PriceType" AS ENUM ('FIXED_PRICE', 'AUCTION');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "AuctionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "BidStatus" AS ENUM ('ACTIVE', 'OUTBID', 'WON', 'LOST');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'FARMER';

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "business_type" TEXT,
ADD COLUMN     "capacity" TEXT,
ADD COLUMN     "company_name" TEXT,
ADD COLUMN     "farm_location" TEXT,
ADD COLUMN     "farm_name" TEXT,
ADD COLUMN     "service_area" TEXT,
ADD COLUMN     "vehicle_type" TEXT,
ADD COLUMN     "warehouse_location" TEXT,
ADD COLUMN     "warehouse_name" TEXT;

-- CreateTable
CREATE TABLE "Listing" (
    "listing_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ListingType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "price_type" "PriceType" NOT NULL DEFAULT 'FIXED_PRICE',
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("listing_id")
);

-- CreateTable
CREATE TABLE "ProduceListing" (
    "produce_listing_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "crop_type" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unit" TEXT NOT NULL,
    "harvest_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "quality_grade" TEXT,

    CONSTRAINT "ProduceListing_pkey" PRIMARY KEY ("produce_listing_id")
);

-- CreateTable
CREATE TABLE "WarehouseListing" (
    "warehouse_listing_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "warehouse_id" TEXT,
    "capacity" DECIMAL(65,30) NOT NULL,
    "capacity_unit" TEXT NOT NULL,
    "available_from" TIMESTAMP(3),
    "available_to" TIMESTAMP(3),
    "climate_controlled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WarehouseListing_pkey" PRIMARY KEY ("warehouse_listing_id")
);

-- CreateTable
CREATE TABLE "TransportListing" (
    "transport_listing_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "vehicle_type" TEXT NOT NULL,
    "capacity" DECIMAL(65,30) NOT NULL,
    "capacity_unit" TEXT NOT NULL,
    "available_from" TIMESTAMP(3),
    "available_to" TIMESTAMP(3),
    "is_refrigerated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TransportListing_pkey" PRIMARY KEY ("transport_listing_id")
);

-- CreateTable
CREATE TABLE "Auction" (
    "auction_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "reserve_price" DECIMAL(65,30),
    "starting_bid" DECIMAL(65,30) NOT NULL,
    "current_highest_bid" DECIMAL(65,30),
    "status" "AuctionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "winner_bid_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("auction_id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "bid_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "bidder_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "BidStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("bid_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProduceListing_listing_id_key" ON "ProduceListing"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseListing_listing_id_key" ON "WarehouseListing"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "TransportListing_listing_id_key" ON "TransportListing"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "Auction_listing_id_key" ON "Auction"("listing_id");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduceListing" ADD CONSTRAINT "ProduceListing_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "Listing"("listing_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseListing" ADD CONSTRAINT "WarehouseListing_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "Listing"("listing_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportListing" ADD CONSTRAINT "TransportListing_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "Listing"("listing_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "Listing"("listing_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
