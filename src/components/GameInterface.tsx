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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Game Info Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="nes-container is-rounded is-dark with-title">
                        <p className="title">{gameTitle}</p>
                        <Emulator 
                            romPath={romPath} 
                            scoreAddress={scoreAddress} 
                            onScoreUpdate={handleScoreUpdate}
                        />
                    </div>

                    {description && (
                        <div className="nes-container is-rounded is-dark with-title">
                            <p className="title">ABOUT THE GAME</p>
                            <div className="text-sm leading-relaxed p-2">
                                {description}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <div className="nes-container is-rounded is-dark with-title">
                        <p className="title">DETAILS</p>
                        
                        <div className="mb-4">
                             <img 
                                src={imageUrl} 
                                alt={gameTitle} 
                                className="w-full border-4 border-c64-border rendering-pixelated mb-4" 
                            />
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span className="text-c64-text">PLATFORM</span>
                                <span className="text-white text-right">{platform || 'COMMODORE 64'}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span className="text-c64-text">GENRE</span>
                                <span className="text-white text-right">{genre || 'RETRO'}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span className="text-c64-text">STATUS</span>
                                <span className="text-green-400 text-right">ARCHIVED</span>
                            </div>
                            
                            <div className="pt-2">
                                 <span className="text-c64-text block mb-2">SOURCE</span>
                                 <a href={originalUrl} className="text-blue-400 hover:text-blue-300 underline break-all" target="_blank" rel="noopener noreferrer">
                                     Original Link <i className="nes-icon is-small external-link"></i>
                                 </a>
                            </div>
                        </div>
                    </div>

                    <div className="nes-container is-rounded is-dark with-title">
                        <p className="title">ACTIONS</p>
                         <div className="flex flex-col gap-3">
                            {romPath ? (
                                <a href={romPath} download className="nes-btn is-success w-full">
                                    DOWNLOAD ROM
                                </a>
                            ) : (
                                <div className="nes-badge w-full">
                                    <span className="is-warning w-full">ROM MISSING</span>
                                </div>
                            )}
                         </div>
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
