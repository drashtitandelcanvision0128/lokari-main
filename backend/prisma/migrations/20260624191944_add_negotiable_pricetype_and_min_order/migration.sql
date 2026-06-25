-- AlterEnum
ALTER TYPE "PriceType" ADD VALUE 'NEGOTIABLE';

-- AlterTable
ALTER TABLE "farmer_produces" ADD COLUMN     "min_order_quantity" DECIMAL(65,30),
ADD COLUMN     "min_order_unit" TEXT;
