
import fs from 'fs';
import path from 'path';
import { slugify } from './utils';

const GAMES_FILE = path.join(process.cwd(), 'src/lib/games.json');

export interface Game {
  title: string;
  slug?: string; // Derived or stored
  url?: string;
  imageUrl?: string;
  description?: string;
  genre?: string;
  platform?: string;
  romPath?: string;
  scoreConfig?: {
    address: string;
    type: string;
    length: number;
  };
}

export async function getGames(): Promise<Game[]> {
  try {
    const data = await fs.promises.readFile(GAMES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading games:", error);
    return [];
  }
}

export async function saveGames(games: Game[]) {
  try {
    await fs.promises.writeFile(GAMES_FILE, JSON.stringify(games, null, 4));
  } catch (error) {
    console.error("Error saving games:", error);
    throw new Error("Failed to save games");
  }
}

export async function addGame(game: Game) {
  const games = await getGames();
  // Generate slug if not present (though we don't store slug in games.json currently, maybe we should?)
  // The current app seems to use slugify(title) dynamically.
  // We will trust the Title as the ID for now, or check for duplicates.
  
  games.push(game);
  await saveGames(games);
  return game;
}

export async function updateGame(originalTitle: string, updatedGame: Game) {
  const games = await getGames();
  const index = games.findIndex(g => slugify(g.title) === slugify(originalTitle));
  
  if (index === -1) {
    throw new Error("Game not found");
  }
  
  games[index] = updatedGame;
  await saveGames(games);
  return updatedGame;
}

export async function deleteGame(titleSlug: string) {
    let games = await getGames();
    const initialLength = games.length;
    games = games.filter(g => slugify(g.title) !== titleSlug);
    
    if (games.length === initialLength) {
        throw new Error("Game not found");
    }
    
    await saveGames(games);
    return true;
}
