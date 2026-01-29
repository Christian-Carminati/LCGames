import { useEffect, useRef, useState } from 'react';

interface EmulatorProps {
  romPath: string | null;
  scoreAddress?: string;
  onScoreUpdate?: (score: number) => void;
}

export function Emulator({ romPath, scoreAddress, onScoreUpdate }: EmulatorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [syncStatus, setSyncStatus] = useState<string>('');

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
        onScoreUpdate?.(event.data.score);
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
    
    // Auto-poll every 60 seconds
    const intervalId = setInterval(triggerExtraction, 60000);

    return () => {
        window.removeEventListener('message', handleMessage);
        clearInterval(intervalId);
    };
  }, [onScoreUpdate]);

  if (!romPath) {
     return (
        <div className="aspect-[4/3] bg-c64-bg border-8 border-c64-border flex items-center justify-center text-c64-text font-c64">
           INSERT CARTRIDGE (ROM MISSING)
        </div>
     );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="aspect-[4/3] w-full border-8 border-c64-border bg-black">
        <iframe 
            ref={iframeRef}
            src={`/emulator.html?rom=${encodeURIComponent(romPath)}${scoreAddress ? `&scoreAddress=${scoreAddress}` : ''}`}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; gamepad"
            title="C64 Emulator"
        />
      </div>
      
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="text-xs text-gray-400 text-center">
            Powered by EmulatorJS. Controls: Arrow Keys + Z (Fire) + Enter (Start).
            <br/>
            Click inside the screen to enable audio/input.
        </div>
        
        <div className="flex items-center gap-4">
            <button 
                onClick={triggerExtraction}
                className="nes-btn is-primary text-xs"
            >
                Sync High Scores Now
            </button>
            {syncStatus && <span className="text-xs text-green-400 animate-pulse">{syncStatus}</span>}
        </div>
      </div>
    </div>
  );
}
