import { PrismaClient, Prisma } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log("Upserting test game 'hero-is-back-c64c128' for Playwright E2E tests...");
  
  try {
    // Find if it already exists
    const existing = await prisma.game.findUnique({
      where: { slug: 'hero-is-back-c64c128' },
      include: { GameConfig: true }
    });

    if (existing) {
      console.log("Game 'hero-is-back-c64c128' already exists. Updating it to ensure correct config...");
      await prisma.game.update({
        where: { slug: 'hero-is-back-c64c128' },
        data: {
          title: "H.E.R.O. Is Back",
          description: "This game is a homage to H.E.R.O. from John Van Ryzin, published by Activision in 1984.",
          platform: "C64",
          genre: "Platformer",
          romPath: "/roms/HeroIsBack.d64",
          published: true,
          GameConfig: {
            upsert: {
              create: {
                id: crypto.randomUUID(),
                scoreConfig: { address: '0x1e2a', type: 'bcd', length: 3, baseOffset: '0x4f9eb0', endianness: 'little', multiplier: 1 } as Prisma.InputJsonValue,
                difficultyConfig: { address: '0x2299', baseOffset: '0x0000', numLevels: 2, levelNames: ['Easy', 'Hard'] } as Prisma.InputJsonValue,
                palNtscConfig: { address: '0x2300', baseOffset: '0x0000', numStandards: 2 } as Prisma.InputJsonValue,
                updatedAt: new Date()
              },
              update: {
                scoreConfig: { address: '0x1e2a', type: 'bcd', length: 3, baseOffset: '0x4f9eb0', endianness: 'little', multiplier: 1 } as Prisma.InputJsonValue,
                difficultyConfig: { address: '0x2299', baseOffset: '0x0000', numLevels: 2, levelNames: ['Easy', 'Hard'] } as Prisma.InputJsonValue,
                palNtscConfig: { address: '0x2300', baseOffset: '0x0000', numStandards: 2 } as Prisma.InputJsonValue,
                updatedAt: new Date()
              }
            }
          }
        }
      });
    } else {
      console.log("Game 'hero-is-back-c64c128' does not exist. Creating it...");
      await prisma.game.create({
        data: {
          slug: 'hero-is-back-c64c128',
          title: "H.E.R.O. Is Back",
          description: "This game is a homage to H.E.R.O. from John Van Ryzin, published by Activision in 1984.",
          platform: "C64",
          genre: "Platformer",
          romPath: "/roms/HeroIsBack.d64",
          published: true,
          GameConfig: {
            create: {
              id: crypto.randomUUID(),
              scoreConfig: { address: '0x1e2a', type: 'bcd', length: 3, baseOffset: '0x4f9eb0', endianness: 'little', multiplier: 1 } as Prisma.InputJsonValue,
              difficultyConfig: { address: '0x2299', baseOffset: '0x0000', numLevels: 2, levelNames: ['Easy', 'Hard'] } as Prisma.InputJsonValue,
              palNtscConfig: { address: '0x2300', baseOffset: '0x0000', numStandards: 2 } as Prisma.InputJsonValue,
              updatedAt: new Date()
            }
          }
        }
      });
    }
    console.log("SUCCESS! Test game upserted successfully.");
  } catch (error) {
    console.error("FAILURE! Error during game upsert:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
