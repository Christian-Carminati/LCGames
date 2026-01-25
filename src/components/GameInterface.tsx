'use client';

import { useState } from 'react';
import { Emulator } from '@/components/Emulator';
import { ScoreBoard } from '@/components/ScoreBoard';

interface GameInterfaceProps {
    gameSlug: string;
    gameTitle: string;
    romPath: string | null;
    scoreAddress?: string;
    imageUrl: string;
    platform?: string;
    genre?: string;
    originalUrl: string;
    description?: string;
    donateLabel?: string;
}

export function GameInterface({ 
    gameSlug, 
    gameTitle, 
    romPath, 
    scoreAddress,
    imageUrl,
    platform,
    genre,
    originalUrl,
    description
}: GameInterfaceProps) {
    const [currentScore, setCurrentScore] = useState<number>(0);

    const handleScoreUpdate = (score: number) => {
        // Keep the highest score seen in this session or just current?
        // Usually current is fine, but for safety lets trigger update
        setCurrentScore(score);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="nes-container is-rounded is-dark with-title">
                <p className="title">{gameTitle}</p>
                <Emulator 
                    romPath={romPath} 
                    scoreAddress={scoreAddress} 
                    onScoreUpdate={handleScoreUpdate}
                />
            </div>

            <div className="nes-container is-rounded is-dark with-title">
                <p className="title">GAME INFO</p>
                <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3">
                        <img src={imageUrl} alt={gameTitle} className="w-full border-4 border-c64-border rendering-pixelated" />
                        </div>
                        <div className="w-full md:w-2/3 space-y-4 text-sm">
                        <p>STATUS: ARCHIVED</p>
                        <p>PLATFORM: {platform || 'COMMODORE 64'}</p>
                        <p>GENRE: {genre || 'RETRO'}</p>
                        <p>ORIGINAL SOURCE: <a href={originalUrl} className="text-c64-text underline" target="_blank">{originalUrl}</a></p>
                        
                        {romPath && (
                            <div className="mt-4">
                                <a href={romPath} download className="nes-btn is-success">
                                    <i className="nes-icon download is-small"></i> COMPACT DISK (ROM)
                                </a>
                            </div>
                        )}

                        {description && (
                            <div className="mt-4 p-4 bg-c64-bg border-4 border-c64-border text-xs leading-relaxed">
                                {description}
                            </div>
                        )}
                        
                        {!romPath && (
                            <div className="nes-badge">
                                <span className="is-warning">ROM MISSING</span>
                            </div>
                        )}
                        </div>
                </div>
            </div>

            <ScoreBoard 
                gameSlug={gameSlug} 
                capturedScore={currentScore}
                isAutoTracked={!!scoreAddress}
            />
        </div>
    );
}
