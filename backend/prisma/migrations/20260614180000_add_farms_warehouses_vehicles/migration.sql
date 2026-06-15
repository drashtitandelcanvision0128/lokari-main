-- CreateTable
CREATE TABLE "farms" (
    "farm_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "capacity" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("farm_id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "warehouse_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "capacity" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("warehouse_id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "vehicle_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "service_area" TEXT,
    "capacity" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("vehicle_id")
);

-- CreateIndex
CREATE INDEX "farms_user_id_idx" ON "farms"("user_id");
CREATE INDEX "warehouses_user_id_idx" ON "warehouses"("user_id");
CREATE INDEX "vehicles_user_id_idx" ON "vehicles"("user_id");

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable (role-specific fields moved to dedicated tables)
ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "farm_name";
ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "farm_location";
ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "warehouse_name";
ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "warehouse_location";
ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "capacity";
ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "vehicle_type";
ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "service_area";
