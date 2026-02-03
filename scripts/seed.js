const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');
// Load environment variables manually
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const gamesPath = path.join(__dirname, '../src/lib/games.json');
  const scoresPath = path.join(__dirname, '../src/data/scores.json');

  const gamesData = JSON.parse(fs.readFileSync(gamesPath, 'utf-8'));
  let scoresData = {};
  try {
    scoresData = JSON.parse(fs.readFileSync(scoresPath, 'utf-8'));
  } catch (e) {
    console.log("No scores file found or invalid.");
  }

  console.log(`Seeding ${gamesData.length} games...`);

  for (const game of gamesData) {
    const slug = game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Create Game
    const dbGame = await prisma.game.upsert({
      where: { slug },
      update: {
        title: game.title,
        description: game.description,
        platform: game.platform,
        genre: game.genre,
        imageUrl: game.imageUrl,
        url: game.url,
        romPath: game.romPath,
        scoreConfig: game.scoreConfig || undefined,
      },
      create: {
        slug,
        title: game.title,
        description: game.description,
        platform: game.platform,
        genre: game.genre,
        imageUrl: game.imageUrl,
        url: game.url,
        romPath: game.romPath,
        scoreConfig: game.scoreConfig || undefined,
      },
    });

    console.log(`Synced game: ${game.title} (${slug})`);

    // Import Scores if any
    if (scoresData[slug]) {
       for (const scoreEntry of scoresData[slug]) {
          if (!scoreEntry.userId && !scoreEntry.name) continue;

          // We need a user. For now, create a placeholder user if userId is email
          // Or if userId is messy, just use the name? 
          // The current scores.json has `userId` as email for logged in, or just `name` for anonymous? 
          // Plan says: User schema has email @unique.
          
          let userEmail = scoreEntry.userId;
          let userName = scoreEntry.name || "Anonymous";

          if (userEmail && userEmail.includes('@')) {
              // Create/Ensure user exists
              const dbUser = await prisma.user.upsert({
                  where: { email: userEmail },
                  update: {
                      name: userName,
                      image: scoreEntry.userImage,
                  },
                  create: {
                      email: userEmail,
                      name: userName,
                      image: scoreEntry.userImage,
                  }
              });

              // Create Score
              await prisma.score.upsert({
                  where: {
                      userId_gameSlug: {
                          userId: dbUser.id, // Wait, schema uses userId -> User.id
                          gameSlug: slug
                      }
                  },
                  update: {
                      value: scoreEntry.score
                  },
                  create: {
                      value: scoreEntry.score,
                      userId: dbUser.id,
                      gameSlug: slug
                  }
              });
          } else {
             console.log(`Skipping anonymous/invalid score for ${slug} (User: ${userName}) - DB requires User link.`);
             // Future: Maybe support anonymous scores? For now, we only seed authenticated ones as per schema.
          }
       }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
