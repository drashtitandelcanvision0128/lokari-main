import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const listings = await prisma.listing.findMany({
    include: {
      produceListing: true,
      warehouseListing: true,
      transportListing: true,
    }
  })
  console.log(JSON.stringify(listings, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
