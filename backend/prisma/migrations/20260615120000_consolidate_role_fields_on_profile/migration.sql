-- Restore role-specific columns on user_profiles (moved back from separate asset tables)
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "farm_name" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "farm_location" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "warehouse_name" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "warehouse_location" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "capacity" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "vehicle_type" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "service_area" TEXT;

-- Copy primary (or first) farm into profile
UPDATE "user_profiles" p
SET
  "farm_name" = f."name",
  "farm_location" = f."location",
  "capacity" = COALESCE(p."capacity", f."capacity")
FROM (
  SELECT DISTINCT ON ("user_id") "user_id", "name", "location", "capacity"
  FROM "farms"
  ORDER BY "user_id", "is_primary" DESC, "created_at" ASC
) f
WHERE p."user_id" = f."user_id";

-- Copy primary (or first) warehouse into profile
UPDATE "user_profiles" p
SET
  "warehouse_name" = w."name",
  "warehouse_location" = w."location",
  "capacity" = COALESCE(p."capacity", w."capacity")
FROM (
  SELECT DISTINCT ON ("user_id") "user_id", "name", "location", "capacity"
  FROM "warehouses"
  ORDER BY "user_id", "is_primary" DESC, "created_at" ASC
) w
WHERE p."user_id" = w."user_id";

-- Copy primary (or first) vehicle into profile
UPDATE "user_profiles" p
SET
  "vehicle_type" = v."vehicle_type",
  "service_area" = v."service_area",
  "capacity" = COALESCE(p."capacity", v."capacity")
FROM (
  SELECT DISTINCT ON ("user_id") "user_id", "vehicle_type", "service_area", "capacity"
  FROM "vehicles"
  ORDER BY "user_id", "is_primary" DESC, "created_at" ASC
) v
WHERE p."user_id" = v."user_id";

-- Remove separate asset tables
DROP TABLE IF EXISTS "farms";
DROP TABLE IF EXISTS "warehouses";
DROP TABLE IF EXISTS "vehicles";

-- Rename tables to match schema.prisma model names
ALTER TABLE "users" RENAME TO "User";
ALTER INDEX "users_pkey" RENAME TO "User_pkey";
ALTER INDEX "users_email_key" RENAME TO "User_email_key";
ALTER INDEX "users_phone_key" RENAME TO "User_phone_key";

ALTER TABLE "user_profiles" RENAME TO "UserProfile";
ALTER INDEX "user_profiles_pkey" RENAME TO "UserProfile_pkey";
ALTER INDEX "user_profiles_user_id_key" RENAME TO "UserProfile_user_id_key";

ALTER TABLE "addresses" RENAME TO "Address";
ALTER INDEX "addresses_pkey" RENAME TO "Address_pkey";
DROP INDEX IF EXISTS "addresses_user_id_idx";

-- Align FK delete rules with schema.prisma (RESTRICT on profile/address)
ALTER TABLE "UserProfile" DROP CONSTRAINT "user_profiles_user_id_fkey";
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Address" DROP CONSTRAINT "addresses_user_id_fkey";
ALTER TABLE "Address" ADD CONSTRAINT "Address_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
