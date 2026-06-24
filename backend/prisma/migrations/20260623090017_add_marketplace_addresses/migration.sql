-- CreateTable
CREATE TABLE "marketplace_addresses" (
    "marketplace_address_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_addresses_pkey" PRIMARY KEY ("marketplace_address_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_addresses_listing_id_key" ON "marketplace_addresses"("listing_id");

-- AddForeignKey
ALTER TABLE "marketplace_addresses" ADD CONSTRAINT "marketplace_addresses_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "marketplace"("listing_id") ON DELETE RESTRICT ON UPDATE CASCADE;
