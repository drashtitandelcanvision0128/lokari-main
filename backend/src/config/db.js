import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
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