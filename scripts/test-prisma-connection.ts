import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Testing Prisma DB Connection...");
  try {
    const games = await prisma.game.findMany();
    console.log("SUCCESS! Games in database:", games.length);
    console.log(games);
  } catch (error) {
    console.error("FAILURE! Cannot connect to DB:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
