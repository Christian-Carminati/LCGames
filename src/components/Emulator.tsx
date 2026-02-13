import { useEffect, useRef, useState } from 'react';

interface EmulatorProps {
  romPath: string | null;
  scoreConfig?: {
      address: string;
      type: string;
      length: number;
      baseOffset?: string;
      endianness?: string;
      multiplier?: number;
  };
  onScoreUpdate?: (score: number, difficulty?: number) => void;
  isAdmin?: boolean;
  difficultyConfig?: { address: string };
}

// Helper to parse search pattern
const parseSearchPattern = (input: string): { bytes: number[]; mode: string } => {
  const trimmed = input.trim();
  
  // 1. Decimal Input (e.g. "250") -> Convert to BCD
  if (/^\d+$/.test(trimmed)) {
      let digits = trimmed;
      if (digits.length % 2 !== 0) digits = '0' + digits; // Pad to even length
      
      // Ensure at least 6 digits (3 bytes) as it's the standard for our games
      while (digits.length < 6) digits = '0' + digits;

      const bytes: number[] = [];
      for (let i = 0; i < digits.length; i += 2) {
         bytes.push(parseInt(digits.substring(i, i+2), 16));
      }
      return { bytes, mode: `(Decimal ${trimmed} -> BCD)` };
  } 
  
  // 2. Hex Input (e.g. "02 50" or "02,50")
  const bytes = trimmed.split(/[\s,]+/)
      .map(x => parseInt(x, 16))
      .filter(n => !isNaN(n));
      
  return { bytes, mode: '(Raw Hex)' };
};

export function Emulator({ romPath, scoreConfig, onScoreUpdate, isAdmin, difficultyConfig }: EmulatorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [debugPattern, setDebugPattern] = useState('');
  const [debugResult, setDebugResult] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const handleHunt = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = iframeRef.current?.contentWindow as any;
    if (win && win.hunt) {
       const { bytes, mode } = parseSearchPattern(debugPattern);
       const reversed = [...bytes].reverse(); // Little Endian
       
       const res = win.hunt(reversed);
       
        if (Array.isArray(res)) {
            const hexPattern = reversed.map(b => b.toString(16).padStart(2, '0')).join(' ');
            const foundList = res.map(addr => `0x${addr.toString(16)} (Dec: ${addr})`).join('\n');
            
            setDebugResult(
                `Hunted for: ${hexPattern} (Little Endian) ${mode}\n` +
                `Found ${res.length} matches:\n${foundList}`
            );
        } else {
            setDebugResult(String(res));
        }
    } else {
       setDebugResult("Hunt function not found or iframe not ready (Click inside game first?)");
    }
  };

  const triggerExtraction = () => {
    if (iframeRef.current?.contentWindow) {
      setSyncStatus('Syncing...');
      iframeRef.current.contentWindow.postMessage('EXTRACT_SAVE', '*');
    }
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Handle Score Update (Memory Monitor)
      if (event.data?.type === 'SCORE_UPDATE' && typeof event.data.score === 'number') {
        onScoreUpdate?.(event.data.score, event.data.difficulty);
      }

      // Handle Pause State
      if (event.data?.type === 'PAUSE_STATE' && typeof event.data.paused === 'boolean') {
        setIsPaused(event.data.paused);
      }

      // Handle Save Extraction
      if (event.data?.type === 'SAVE_EXTRACTED' && event.data.file) {
        try {
            const file = event.data.file as Blob;
            const formData = new FormData();
            formData.append('file', file, 'save_dump.d64');

            const res = await fetch('/api/upload-score', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setSyncStatus(`Synced! (Top: ${data.newScores?.[0]?.score || '?'})`);
                // Clear status after 3s
                setTimeout(() => setSyncStatus(''), 3000);
            } else {
                setSyncStatus('Sync Failed');
                console.error('Upload failed');
            }
        } catch (e) {
            console.error('Error uploading save:', e);
            setSyncStatus('Error');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
        window.removeEventListener('message', handleMessage);
    };
  }, [onScoreUpdate]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
      setIsPlaying(true);
      setTimeout(() => {
          if (containerRef.current) {
              const element = containerRef.current;
              if (element.requestFullscreen) {
                  element.requestFullscreen().catch(err => console.error("Fullscreen error:", err));
              }
          }
      }, 100);
  };

  if (!romPath) {
     return (
        <div className="aspect-[4/3] bg-c64-bg border-8 border-c64-border flex items-center justify-center text-c64-text font-c64">
           INSERT CARTRIDGE (ROM MISSING)
        </div>
     );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div ref={containerRef} className="aspect-[4/3] w-full border-8 border-c64-border bg-black relative">
        {!isPlaying ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                <p className="text-c64-text mb-4 text-center">READY PLAYER ONE?</p>
                <button 
                    onClick={handlePlay} 
                    className="nes-btn is-primary"
                >
                    PLAY GAME
                </button>
            </div>
        ) : (
            <>
                <iframe 
                    ref={iframeRef}
                    src={`/emulator.html?rom=${encodeURIComponent(romPath)}${scoreConfig ? `&scoreConfig=${encodeURIComponent(JSON.stringify(scoreConfig))}` : ''}${isAdmin ? '&debug=1' : ''}${difficultyConfig ? `&difficultyConfig=${encodeURIComponent(JSON.stringify(difficultyConfig))}` : ''}`}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen; gamepad"
                    title="C64 Emulator"
                />
                {isPaused && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                        <div className="text-center">
                            <p className="text-yellow-400 text-2xl font-bold animate-pulse">⏸ PAUSED</p>
                            <p className="text-gray-400 text-xs mt-2">Press P to resume</p>
                        </div>
                    </div>
                )}
            </>
        )}
      </div>
      
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="text-xs text-gray-400 text-center">
            Powered by EmulatorJS. Controls: Arrow Keys + X (Fire) + Enter (Start) + P (Pause).
            <br/>
            Click inside the screen to enable audio/input.
        </div>
        
        <div className="flex items-center gap-4">
            {/* Sync button removed - using RAM based submission in ScoreBoard */}
            {syncStatus && <span className="text-xs text-green-400 animate-pulse">{syncStatus}</span>}
        </div>

        {/* DEBUGGING TOOL - Only for Admin */}
        {isAdmin && (
            <div className="w-full max-w-md bg-gray-900/80 p-3 rounded mt-4 border border-gray-700">
                <h3 className="text-xs uppercase text-gray-500 mb-2 font-bold">Memory Hunter</h3>
                <div className="flex gap-2">
                    <input 
                        type="text"
                        value={debugPattern}
                        onChange={(e) => setDebugPattern(e.target.value)}
                        placeholder="e.g. 250"
                        className="flex-1 bg-black border border-gray-700 text-green-400 font-mono text-sm px-2 py-1 rounded focus:outline-none focus:border-green-500"
                    />
                    <button 
                        onClick={handleHunt}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase font-bold px-3 py-1 rounded"
                    >
                        Hunt
                    </button>
                </div>
                {debugResult && (
                    <div className="mt-2 p-2 bg-black border border-gray-800 rounded font-mono text-xs text-yellow-500 whitespace-pre-wrap">
                        {debugResult}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
