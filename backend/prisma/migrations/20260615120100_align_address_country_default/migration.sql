-- Align with schema.prisma (country has no default)
ALTER TABLE "Address" ALTER COLUMN "country" DROP DEFAULT;
