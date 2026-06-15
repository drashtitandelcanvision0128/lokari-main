-- RenameTable
ALTER TABLE "UserProfile" RENAME TO "user_profiles";
ALTER TABLE "Address" RENAME TO "addresses";

-- RenameIndex
ALTER INDEX "UserProfile_pkey" RENAME TO "user_profiles_pkey";
ALTER INDEX "UserProfile_user_id_key" RENAME TO "user_profiles_user_id_key";
ALTER INDEX "Address_pkey" RENAME TO "addresses_pkey";

-- AlterTable
ALTER TABLE "addresses" ALTER COLUMN "country" SET DEFAULT 'India';

-- CreateIndex
CREATE INDEX "addresses_user_id_idx" ON "addresses"("user_id");

-- DropForeignKey
ALTER TABLE "user_profiles" DROP CONSTRAINT "UserProfile_user_id_fkey";
ALTER TABLE "addresses" DROP CONSTRAINT "Address_user_id_fkey";

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
