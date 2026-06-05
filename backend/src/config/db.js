import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("Database connected via Prisma");
    }
    catch (error) {
        console.error("Error connecting to database", error);
        process.exit(1); // Since we are in development mode, we can exit the process
    }
}

const disconnectDB = async () => {
    await prisma.$disconnect();

}

export { prisma, connectDB, disconnectDB }