
import fs from 'fs';
import path from 'path';

async function getStats() {
  const gamesPath = path.join(process.cwd(), 'src/lib/games.json');
  const scoresPath = path.join(process.cwd(), 'src/data/scores.json');

  let gamesCount = 0;
  let scoresCount = 0;

  try {
    const gamesData = await fs.promises.readFile(gamesPath, 'utf-8');
    const games = JSON.parse(gamesData);
    gamesCount = games.length;
  } catch (e) {
    console.error("Error reading games for stats", e);
  }

  try {
    const scoresData = await fs.promises.readFile(scoresPath, 'utf-8');
    const scores = JSON.parse(scoresData);
    // scores is object { gameSlug: [ ... ] }
    scoresCount = Object.values(scores).reduce((acc: number, curr: any) => acc + curr.length, 0);
  } catch (e) {
     // ignore if no scores yet
  }

  return { gamesCount, scoresCount };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <h1 className="nes-text is-primary text-3xl">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="nes-container with-title is-rounded">
          <p className="title">Games</p>
          <div className="text-center">
             <span className="nes-text is-success text-4xl">{stats.gamesCount}</span>
             <p>Total Games</p>
          </div>
        </div>

        <div className="nes-container with-title is-rounded">
            <p className="title">Scores</p>
            <div className="text-center">
                <span className="nes-text is-warning text-4xl">{stats.scoresCount}</span>
                <p>Total Scores Submitted</p>
            </div>
        </div>
      </div>
    </div>
  );
}
