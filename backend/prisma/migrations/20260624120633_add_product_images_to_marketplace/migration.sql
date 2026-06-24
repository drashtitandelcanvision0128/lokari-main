-- AlterTable
ALTER TABLE "marketplace" ADD COLUMN     "product_images" TEXT[] DEFAULT ARRAY[]::TEXT[];
