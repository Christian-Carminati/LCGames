'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';

interface Score {
  name: string;
  score: number;
  date: string;
  userImage?: string;
}

interface ScoreBoardProps {
  gameSlug: string;
  capturedScore?: number;
  isAutoTracked?: boolean;
}

export function ScoreBoard({ gameSlug, capturedScore, isAutoTracked }: ScoreBoardProps) {
  const { data: session } = useSession();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch scores from API
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch(`/api/scores?gameSlug=${gameSlug}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            // Frontend keeps only top 10
            setScores(data.slice(0, 10));
          } else {
            console.error("Received invalid scores data:", data);
            setScores([]);
          }
        }
      } catch (e) {
        console.error("Failed to fetch scores", e);
        setScores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [gameSlug]);

  const handleSaveScore = async () => {
    if (!session || capturedScore === undefined) return;

    setSubmitting(true);
    try {
        const res = await fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gameSlug,
                score: capturedScore
            })
        });

        if (res.ok) {
            const updatedScores = await res.json();
            // Update local state with top 10
            setScores(updatedScores.slice(0, 10));
            alert("Score Saved!");
        } else {
            alert("Failed to save score.");
        }
    } catch (e) {
        console.error("Failed to save score", e);
        alert("Error saving score.");
    } finally {
        setSubmitting(false);
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
             
             <div className="mt-4 relative z-10">
               {session ? (
                 <button 
                    type="button" 
                    className={`nes-btn is-success ${submitting ? 'is-disabled' : ''}`}
                    onClick={handleSaveScore}
                    disabled={submitting || capturedScore === undefined || capturedScore === 0}
                 >
                    {submitting ? 'SAVING...' : 'SAVE SCORE'}
                 </button>
               ) : (
                 <button 
                    type="button" 
                    className="nes-btn is-primary"
                    onClick={() => signIn('google')}
                 >
                    LOGIN TO SAVE
                 </button>
               )}
             </div>
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
