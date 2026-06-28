-- CreateEnum
CREATE TYPE "ListingVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "marketplace" ADD COLUMN     "verification_status" "ListingVerificationStatus" NOT NULL DEFAULT 'PENDING';
