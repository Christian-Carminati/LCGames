'use client';

import { useState, useEffect } from 'react';

interface Score {
  name: string;
  score: number;
  date: string;
}

interface ScoreBoardProps {
  gameSlug: string;
}

export function ScoreBoard({ gameSlug }: ScoreBoardProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [name, setName] = useState('');
  const [scoreInput, setScoreInput] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const savedScores = localStorage.getItem(`lcgames-scores-${gameSlug}`);
    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores));
      } catch (e) {
        console.error("Failed to parse scores", e);
      }
    }
  }, [gameSlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !scoreInput) return;

    const newScore: Score = {
      name: name.toUpperCase().slice(0, 10), // Limit name length
      score: parseInt(scoreInput) || 0,
      date: new Date().toLocaleDateString()
    };

    const updatedScores = [...scores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Keep top 10

    setScores(updatedScores);
    localStorage.setItem(`lcgames-scores-${gameSlug}`, JSON.stringify(updatedScores));
    
    setName('');
    setScoreInput('');
    setShowForm(false);
  };

  return (
    <div className="nes-container is-rounded is-dark with-title">
      <p className="title">HIGH SCORES</p>
      
      {scores.length === 0 ? (
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
                ADD RECORD
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
                    />
                </div>
                <div className="nes-field">
                    <label htmlFor="score_field" className="text-sm">SCORE</label>
                    <input 
                        type="number" 
                        id="score_field" 
                        className="nes-input is-dark" 
                        placeholder="000000"
                        value={scoreInput}
                        onChange={(e) => setScoreInput(e.target.value)} 
                        required
                    />
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
