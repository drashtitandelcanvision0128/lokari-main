/*
  Warnings:

  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Auction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bid` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Listing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProduceListing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransportListing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WarehouseListing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Auction" DROP CONSTRAINT "Auction_listing_id_fkey";

-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_bidder_id_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ProduceListing" DROP CONSTRAINT "ProduceListing_listing_id_fkey";

-- DropForeignKey
ALTER TABLE "TransportListing" DROP CONSTRAINT "TransportListing_listing_id_fkey";

-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_user_id_fkey";

-- DropForeignKey
ALTER TABLE "WarehouseListing" DROP CONSTRAINT "WarehouseListing_listing_id_fkey";

-- DropTable
DROP TABLE "Address";

-- DropTable
DROP TABLE "Auction";

-- DropTable
DROP TABLE "Bid";

-- DropTable
DROP TABLE "Listing";

-- DropTable
DROP TABLE "ProduceListing";

-- DropTable
DROP TABLE "TransportListing";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UserProfile";

-- DropTable
DROP TABLE "WarehouseListing";

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'FARMER',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "profile_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "avatar_url" TEXT,
    "bio" TEXT,
    "kyc_status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "farm_name" TEXT,
    "farm_location" TEXT,
    "company_name" TEXT,
    "business_type" TEXT,
    "warehouse_name" TEXT,
    "warehouse_location" TEXT,
    "capacity" TEXT,
    "vehicle_type" TEXT,
    "service_area" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "address_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("address_id")
);

-- CreateTable
CREATE TABLE "marketplace" (
    "listing_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ListingType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "listing_location" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "price_type" "PriceType" NOT NULL DEFAULT 'FIXED_PRICE',
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_pkey" PRIMARY KEY ("listing_id")
);

-- CreateTable
CREATE TABLE "farmer_produces" (
    "produce_listing_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "crop_type" TEXT NOT NULL,
    "variety" TEXT,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unit" TEXT NOT NULL,
    "harvest_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "quality_grade" TEXT,
    "storage_temperature" TEXT,
    "storage_humidity" TEXT,

    CONSTRAINT "farmer_produces_pkey" PRIMARY KEY ("produce_listing_id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "warehouse_listing_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "warehouse_id" TEXT,
    "capacity" DECIMAL(65,30) NOT NULL,
    "capacity_unit" TEXT NOT NULL,
    "available_from" TIMESTAMP(3),
    "available_to" TIMESTAMP(3),
    "climate_controlled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("warehouse_listing_id")
);

-- CreateTable
CREATE TABLE "transports" (
    "transport_listing_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "vehicle_type" TEXT NOT NULL,
    "capacity" DECIMAL(65,30) NOT NULL,
    "capacity_unit" TEXT NOT NULL,
    "available_from" TIMESTAMP(3),
    "available_to" TIMESTAMP(3),
    "is_refrigerated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "transports_pkey" PRIMARY KEY ("transport_listing_id")
);

-- CreateTable
CREATE TABLE "auctions" (
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

    CONSTRAINT "auctions_pkey" PRIMARY KEY ("auction_id")
);

-- CreateTable
CREATE TABLE "bids" (
    "bid_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "bidder_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "BidStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("bid_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "farmer_produces_listing_id_key" ON "farmer_produces"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_listing_id_key" ON "warehouses"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "transports_listing_id_key" ON "transports"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "auctions_listing_id_key" ON "auctions"("listing_id");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace" ADD CONSTRAINT "marketplace_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_produces" ADD CONSTRAINT "farmer_produces_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "marketplace"("listing_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "marketplace"("listing_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transports" ADD CONSTRAINT "transports_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "marketplace"("listing_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "marketplace"("listing_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
