'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useNotification } from '@/context/NotificationContext';

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
  currentDifficulty?: number;
  hasDifficultyLevels?: boolean;
  numDifficultyLevels?: number;
}

export function ScoreBoard({ gameSlug, capturedScore, isAutoTracked, currentDifficulty = 0, hasDifficultyLevels = false, numDifficultyLevels = 1 }: ScoreBoardProps) {
  const { data: session } = useSession();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(0);
  const { showNotification } = useNotification();

  // --- Pending Score Recovery (after login redirect) ---
  const savePendingScore = useCallback(async (pending: { gameSlug: string; score: number; difficulty: number }) => {
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pending)
      });
      if (res.ok) {
        const updatedScores = await res.json();
        setScores(updatedScores.slice(0, 10));
        showNotification(`Score ${pending.score} saved after login!`, 'success');
      }
    } catch (e) {
      console.error('Failed to save pending score:', e);
    }
  }, [showNotification]);

  useEffect(() => {
    if (session) {
      const raw = sessionStorage.getItem('pendingScore');
      if (raw) {
        try {
          const pending = JSON.parse(raw);
          if (pending.gameSlug === gameSlug && pending.score > 0) {
            sessionStorage.removeItem('pendingScore');
            savePendingScore(pending);
          }
        } catch { /* ignore */ }
      }
    }
  }, [session, gameSlug, savePendingScore]);

  // Sync selected difficulty with current emulator difficulty
  useEffect(() => {
    if (hasDifficultyLevels) {
      setSelectedDifficulty(currentDifficulty);
    }
  }, [currentDifficulty, hasDifficultyLevels]);

  // Fetch scores from API
  useEffect(() => {
    let active = true;
    
    const fetchScores = async () => {
      setLoading(true);
      try {
        const diffParam = hasDifficultyLevels ? `&difficulty=${selectedDifficulty}` : '';
        const res = await fetch(`/api/scores?gameSlug=${gameSlug}${diffParam}`);
        
        if (!active) return;
        
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            // Frontend keeps only top 10
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
  }, [gameSlug, selectedDifficulty, hasDifficultyLevels]);

  
  const handleSaveScore = async () => {
    if (!session || capturedScore === undefined) return;

    setSubmitting(true);
    try {
        const res = await fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gameSlug,
                score: capturedScore,
                difficulty: hasDifficultyLevels ? currentDifficulty : 0
            })
        });

        if (res.ok) {
            const updatedScores = await res.json();
            // Update local state with top 10
            setScores(updatedScores.slice(0, 10));
            
            // Force the tab to match where the score was saved
            if (hasDifficultyLevels) {
                setSelectedDifficulty(currentDifficulty);
            }
            
            showNotification("Score Saved!", "success");
        } else {
            showNotification("Failed to save score.", "error");
        }
    } catch (e) {
        console.error("Failed to save score", e);
        showNotification("Error saving score.", "error");
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="nes-container is-rounded is-dark with-title">
      <p className="title">HIGH SCORES</p>

      {/* Difficulty Tabs */}
      {hasDifficultyLevels && numDifficultyLevels > 1 && (
        <div className="mb-4 flex flex-wrap gap-2 justify-center relative z-50">
          {Array.from({ length: numDifficultyLevels }, (_, i) => i).map((d) => (
            <button
              key={d}
              type="button"
              className={`nes-btn ${selectedDifficulty === d ? 'is-primary' : ''}`}
              onClick={() => setSelectedDifficulty(d)}
              style={{ fontSize: '0.65rem', padding: '4px 8px' }}
            >
              LV.{d}
            </button>
          ))}
        </div>
      )}
      
      {/* Show Current/Captured Score Panel for Auto-Tracked Games */}
      {isAutoTracked && (
        <div className="mb-6 bg-gray-900 border-b-4 border-gray-700 pb-4 text-center">
             <p className="text-xs text-gray-400 mb-2">CURRENT SCORE</p>
             <p className="text-4xl text-green-400">{capturedScore ?? 0}</p>
             {hasDifficultyLevels && (
               <p className="text-xs text-yellow-400 mt-1">DIFFICULTY: {currentDifficulty}</p>
             )}
             
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
                 <>
                 <button 
                    type="button" 
                    className="nes-btn is-primary"
                    onClick={() => {
                      // Save pending score to sessionStorage before redirect
                      if (capturedScore !== undefined && capturedScore > 0) {
                        sessionStorage.setItem('pendingScore', JSON.stringify({
                          gameSlug,
                          score: capturedScore,
                          difficulty: hasDifficultyLevels ? currentDifficulty : 0
                        }));
                      }
                      signIn('google', { callbackUrl: window.location.href });
                    }}
                 >
                    LOGIN TO SAVE
                 </button>
                 <p className="text-xs text-yellow-500 mt-2 animate-pulse">⚠️ Score won&apos;t be saved without login</p>
                 </>
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
