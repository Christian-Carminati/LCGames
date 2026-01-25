import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GAMES_PATH = path.join(__dirname, '../src/lib/games.json');

// Helper to delay requests
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapeGameData(game) {
    if (game.description && game.description.length > 50) {
        console.log(`Skipping ${game.title} (already has data)`);
        return game;
    }

    console.log(`Scraping ${game.title} from ${game.url}...`);
    
    try {
        const res = await fetch(game.url);
        const html = await res.text();
        const $ = cheerio.load(html);

        // Extract description
        // usually in .formatted_description
        // We take the first few paragraphs
        let description = '';
        const descContainer = $('.formatted_description');
        if (descContainer.length) {
            // Get first paragraph or text
            description = descContainer.text().trim().split('\n')[0]; // Simple first line/paragraph
            // Limit length
            if (description.length > 300) {
                description = description.substring(0, 297) + '...';
            }
        }

        // Extract Genre/Platform tags
        // itch.io tags are usually in .game_info_panel_widget
        let genre = 'Retro';
        let platform = 'C64';

        // Check tags
        $('a[href*="/genre-"]').each((i, el) => {
             genre = $(el).text();
        });

        // Basic platform check
        const textContent = $('body').text();
        if (textContent.includes('C64') || textContent.includes('Commodore 64')) {
            platform = 'C64';
        } else if (textContent.includes('Amiga')) {
            platform = 'Amiga';
        }

        return {
            ...game,
            description: description || game.description, // keep old if fail
            genre: genre,
            platform: platform
        };

    } catch (e) {
        console.error(`Failed to scrape ${game.title}:`, e.message);
        return game;
    }
}

async function main() {
    const rawData = fs.readFileSync(GAMES_PATH, 'utf-8');
    let games = JSON.parse(rawData);

    console.log(`Found ${games.length} games. Starting scrape...`);

    const updatedGames = [];
    for (const game of games) {
        const enrichedGame = await scrapeGameData(game);
        updatedGames.push(enrichedGame);
        await delay(1000); // 1 sec delay between requests
    }

    fs.writeFileSync(GAMES_PATH, JSON.stringify(updatedGames, null, 4));
    console.log("Done! Updated games.json");
}

main();
