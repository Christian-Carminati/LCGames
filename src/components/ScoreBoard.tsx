'use client';

import { useState, useEffect } from 'react';

interface Score {
  name: string;
  score: number;
  date: string;
  userImage?: string;
}

interface ScoreBoardProps {
  gameSlug: string;
  hasDifficultyLevels?: boolean;
  numDifficultyLevels?: number;
  difficultyNames?: string[];
  hasPalNtsc?: boolean;
  currentStandard?: 'PAL' | 'NTSC';
}

export function ScoreBoard({ gameSlug, hasDifficultyLevels = false, numDifficultyLevels = 1, difficultyNames = [], hasPalNtsc = false, currentStandard = 'PAL' }: ScoreBoardProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(0);
  const [selectedStandard, setSelectedStandard] = useState<'PAL' | 'NTSC'>(currentStandard);

  useEffect(() => {
    setSelectedStandard(currentStandard);
  }, [currentStandard]);

  useEffect(() => {
    let active = true;
    
    const fetchScores = async () => {
      setLoading(true);
      try {
        let diffParam = '';
        if (hasDifficultyLevels || hasPalNtsc) {
          // Calculate combined difficulty: base difficulty + offset for PAL/NTSC
          const baseDifficulty = hasDifficultyLevels ? selectedDifficulty : 0;
          const standardOffset = hasPalNtsc && selectedStandard === 'NTSC' ? numDifficultyLevels : 0;
          const combinedDifficulty = baseDifficulty + standardOffset;
          diffParam = `&difficulty=${combinedDifficulty}`;
        }
        const res = await fetch(`/api/scores?gameSlug=${gameSlug}${diffParam}`);
        
        if (!active) return;
        
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setScores(data.slice(0, 10));
          } else {
            console.error("Received invalid scores data:", data);
            setScores([]);
          }
        } else {
          setScores([]);
        }
      } catch (e) {
        console.error("Failed to fetch scores", e);
        if (active) setScores([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchScores();
    
    return () => {
      active = false;
    };
  }, [gameSlug, selectedDifficulty, hasDifficultyLevels, selectedStandard, hasPalNtsc, numDifficultyLevels]);

  const getDifficultyName = (levelIndex: number): string => {
    if (difficultyNames[levelIndex]) {
      return difficultyNames[levelIndex];
    }
    switch (levelIndex) {
      case 0: return 'EASY';
      case 1: return 'MEDIUM';
      case 2: return 'HARD';
      default: return `HARD ${levelIndex - 1}`;
    }
  };

  return (
    <div className="nes-container is-rounded is-dark with-title">
      <p className="title">HIGH SCORES</p>

      {hasDifficultyLevels && numDifficultyLevels > 1 && (
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex justify-center relative z-50">
            {numDifficultyLevels <= 5 ? (
              <div className="flex flex-wrap gap-2 justify-center">
                {Array.from({ length: numDifficultyLevels }, (_, i) => i).map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`nes-btn ${selectedDifficulty === d ? 'is-primary' : ''}`}
                    onClick={() => setSelectedDifficulty(d)}
                    style={{ fontSize: '0.65rem', padding: '4px 8px' }}
                  >
                    {getDifficultyName(d).toUpperCase()}
                  </button>
                ))}
              </div>
            ) : (
              <div className="nes-select is-dark">
                <select
                  required
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(parseInt(e.target.value, 10))}
                  className="text-xs"
                >
                  {Array.from({ length: numDifficultyLevels }, (_, i) => i).map((d) => (
                    <option key={d} value={d}>
                      {getDifficultyName(d).toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {hasPalNtsc && (
            <div className="flex justify-center gap-2">
              <button
                type="button"
                className={`nes-btn ${selectedStandard === 'PAL' ? 'is-success' : ''}`}
                onClick={() => setSelectedStandard('PAL')}
                style={{ fontSize: '0.65rem', padding: '4px 8px' }}
              >
                PAL
              </button>
              <button
                type="button"
                className={`nes-btn ${selectedStandard === 'NTSC' ? 'is-success' : ''}`}
                onClick={() => setSelectedStandard('NTSC')}
                style={{ fontSize: '0.65rem', padding: '4px 8px' }}
              >
                NTSC
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center text-xs py-4">LOADING...</div>
      ) : scores.length === 0 ? (
        <div className="text-center text-sm py-4 text-gray-400">
          NO RECORDS YET. BE THE FIRST!
        </div>
      ) : (
        <div className="nes-table-responsive relative z-10">
          <table className="nes-table is-bordered is-dark w-full text-xs">
            <thead>
              <tr>
                <th>RNK</th>
                <th>NAME</th>
                <th>SCORE</th>
                <th className="hidden sm:table-cell">DATE</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((entry, index) => (
                <tr key={index}>
                    <td>{index + 1}</td>
                    <td className="flex items-center gap-2">
                        {entry.userImage && (
                            <img src={entry.userImage} alt="" className="w-4 h-4 rounded-full inline-block" />
                        )}
                        {entry.name}
                    </td>
                    <td className="text-yellow-400">{entry.score}</td>
                    <td className="hidden sm:table-cell text-gray-400">{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
