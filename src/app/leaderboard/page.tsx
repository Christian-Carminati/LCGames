'use client';

import { useState, useEffect } from 'react';
import 'nes.css/css/nes.min.css'; // Ensure NES.css is imported if not globally available, or rely on global CSS

interface LeaderboardEntry {
  pos: number;
  score: string;
  name: string;
  uploadedAt: string;
}

export default function LeaderboardPage() {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchScores = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setScores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    if (!file.name.toLowerCase().endsWith('.d64')) {
        setMessage('Please upload a .d64 file');
        return;
    }

    setUploading(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch('/api/upload-score', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        
        if (res.ok) {
            setMessage(`Success! Added ${data.newScores?.length || 0} scores.`);
            fetchScores(); // Refresh list
        } else {
            setMessage(`Error: ${data.message || data.error}`);
        }
    } catch (err) {
        setMessage('Upload failed.');
        console.error(err);
    } finally {
        setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-8 text-center">
            <h1 className="nes-text is-primary text-4xl mb-4">Dig Dug Revival</h1>
            <h2 className="text-2xl text-yellow-500">Global High Scores</h2>
        </header>

        <div className="nes-container is-dark with-title mb-8">
            <p className="title">Upload High Scores</p>
            <div className="flex flex-col gap-4 items-center">
                <p>Upload your <code>DIGDUGREVIVAL.d64</code> file to update the leaderboard.</p>
                <div className="bg-gray-800 p-4 rounded text-center">
                     <input type="file" accept=".d64" onChange={handleFileUpload} disabled={uploading} className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                      "/>
                </div>
                {uploading && <span className="nes-text is-warning">Processing...</span>}
                {message && <span className={`nes-text ${message.startsWith('Success') ? 'is-success' : 'is-error'}`}>{message}</span>}
            </div>
        </div>

        <div className="nes-table-responsive">
            <table className="nes-table is-bordered is-centered is-dark w-full">
                <thead>
                    <tr>
                        <th className="text-yellow-400">#</th>
                        <th className="text-green-400">SCORE</th>
                        <th className="text-blue-400">NAME</th>
                        <th className="text-gray-400">DATE</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={4}>Loading...</td></tr>
                    ) : scores.length === 0 ? (
                        <tr><td colSpan={4}>No scores yet. Be the first!</td></tr>
                    ) : (
                        scores.map((entry, i) => (
                            <tr key={i}>
                                <td>{entry.pos}</td>
                                <td>{entry.score}</td>
                                <td>{entry.name}</td>
                                <td className="text-xs text-gray-500">
                                    {new Date(entry.uploadedAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

      </div>
    </div>
  );
}
