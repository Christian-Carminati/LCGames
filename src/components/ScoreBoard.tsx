'use client';

import { useState, useEffect } from 'react';

interface Score {
  name: string;
  score: number;
  date: string;
}

interface ScoreBoardProps {
  gameSlug: string;
  capturedScore?: number;
  isAutoTracked?: boolean;
}

export function ScoreBoard({ gameSlug, capturedScore, isAutoTracked }: ScoreBoardProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [name, setName] = useState('');
  const [scoreInput, setScoreInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch scores from API
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch(`/api/scores?gameSlug=${gameSlug}`);
        if (res.ok) {
          const data = await res.json();
          setScores(data);
        }
      } catch (e) {
        console.error("Failed to fetch scores", e);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [gameSlug]);

  // Update score input when form opens or captured score changes
  useEffect(() => {
      if (isAutoTracked && typeof capturedScore === 'number') {
          setScoreInput(capturedScore.toString());
      }
  }, [capturedScore, isAutoTracked, showForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // For auto-tracked games, ensure we strictly use the captured score if available
    const finalScore = isAutoTracked && typeof capturedScore === 'number' 
        ? capturedScore 
        : parseInt(scoreInput);

    if (!name || isNaN(finalScore)) return;

    try {
        const res = await fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gameSlug,
                name,
                score: finalScore
            })
        });

        if (res.ok) {
            const updatedScores = await res.json();
            setScores(updatedScores);
            setName('');
            if (!isAutoTracked) setScoreInput('');
            setShowForm(false);
        }
    } catch (e) {
        console.error("Failed to save score", e);
    }
  };

  return (
    <div className="nes-container is-rounded is-dark with-title">
      <p className="title">HIGH SCORES</p>
      
      {/* Show Current/Captured Score Panel for Auto-Tracked Games */}
      {isAutoTracked && (
        <div className="mb-6 bg-gray-900 border-b-4 border-gray-700 pb-4 text-center">
             <p className="text-xs text-gray-400 mb-2">CURRENT SCORE</p>
             <p className="text-4xl text-green-400">{capturedScore ?? 0}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center text-xs py-4">LOADING...</div>
      ) : scores.length === 0 ? (
        <div className="text-center text-sm py-4 text-gray-400">
          NO RECORDS YET. BE THE FIRST!
        </div>
      ) : (
        <div className="nes-table-responsive">
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
                    <td>{entry.name}</td>
                    <td className="text-yellow-400">{entry.score}</td>
                    <td className="hidden sm:table-cell text-gray-400">{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        {!showForm ? (
            <button 
                type="button" 
                className="nes-btn is-primary"
                onClick={() => setShowForm(true)}
            >
                {isAutoTracked ? 'SUBMIT SCORE' : 'ADD RECORD'}
            </button>
        ) : (
            <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4 bg-gray-900 p-4 border-2 border-white">
                <div className="nes-field">
                    <label htmlFor="name_field" className="text-sm">NAME</label>
                    <input 
                        type="text" 
                        id="name_field" 
                        className="nes-input is-dark" 
                        placeholder="AAA" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={10}
                        required
                        autoFocus
                    />
                </div>
                
                <div className="nes-field">
                    <label htmlFor="score_field" className="text-sm">SCORE</label>
                    <input 
                        type="number" 
                        id="score_field" 
                        className={`nes-input is-dark ${isAutoTracked ? 'is-disabled' : ''}`}
                        placeholder="000000"
                        value={isAutoTracked && capturedScore !== undefined ? capturedScore : scoreInput}
                        onChange={(e) => !isAutoTracked && setScoreInput(e.target.value)} 
                        required
                        disabled={isAutoTracked}
                    />
                    {isAutoTracked && <p className="text-xs text-gray-500 mt-1">Score is automatically captured.</p>}
                </div>

                <div className="flex gap-2 justify-end">
                    <button 
                        type="button" 
                        className="nes-btn is-error"
                        onClick={() => setShowForm(false)}
                    >
                        CANCEL
                    </button>
                    <button type="submit" className="nes-btn is-success">
                        SAVE
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
}
