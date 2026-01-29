import fs from 'fs';
import path from 'path';
import { ScoreEntry } from './d64Utils';

const DATA_FILE = path.join(process.cwd(), 'src/data/leaderboard.json');

export interface LeaderboardEntry extends ScoreEntry {
  uploadedAt: string;
}

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

export function getLeaderboard(): LeaderboardEntry[] {
  ensureDataFile();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read leaderboard:', error);
    return [];
  }
}

export function saveScores(newScores: ScoreEntry[]): LeaderboardEntry[] {
  const current = getLeaderboard();
  
  // Merge strategies:
  // 1. Just verify if the exact score+name exists?
  // 2. Or just add everything and sort?
  // User asked for "classifica online comune". Usually implies a global High Score list.
  // The D64 contains the top 5 scores from that machine.
  // We should add these to the global pool.
  
  const timestamp = new Date().toISOString();
  
  let updated = [...current];
  
  for (const s of newScores) {
    // Basic deduplication: duplicate if same name and score
    const exists = current.some(e => e.name === s.name && e.score === s.score);
    if (!exists && s.name.trim() !== '') { // Filter empty names just in case
        updated.push({ ...s, uploadedAt: timestamp });
    }
  }
  
  // Sort by score (assuming score is hex string, larger is better)
  // Hex strings compare lexicographically correctly if same length (which they are, 4 chars)
  updated.sort((a, b) => {
    // Descending order
    if (b.score > a.score) return 1;
    if (b.score < a.score) return -1;
    return 0;
  });
  
  // Optional: Limit total global leaderboard size? 
  // Let's keep top 100 for now.
  if (updated.length > 100) {
      updated = updated.slice(0, 100);
  }

  // Re-assign positions based on global rank
  updated = updated.map((entry, index) => ({
      ...entry,
      pos: index + 1
  }));

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2));
  } catch (error) {
    console.error('Failed to save leaderboard:', error);
  }
  
  return updated;
}
