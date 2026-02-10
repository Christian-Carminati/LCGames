'use client';

import { useState } from 'react';
import { Emulator } from '@/components/Emulator';
import { ScoreBoard } from '@/components/ScoreBoard';

interface GameInterfaceProps {
    gameSlug: string;
    gameTitle: string;
    romPath: string | null;
    scoreConfig?: {
        address: string;
        type: string;
        length: number;
        multiplier?: number;
        baseOffset?: string;
        endianness?: string;
    };
    imageUrl: string;
    platform?: string;
    genre?: string;
    originalUrl: string;
    description?: string;
    donateLabel?: string;
    isAdmin?: boolean;
    youtubeUrl?: string;
    difficultyConfig?: { address: string };
}

function getYouTubeEmbedUrl(url: string): string | null {
    try {
        const parsed = new URL(url);
        // Handle youtube.com/watch?v=ID
        if (parsed.hostname.includes('youtube.com') && parsed.searchParams.get('v')) {
            return `https://www.youtube.com/embed/${parsed.searchParams.get('v')}`;
        }
        // Handle youtu.be/ID
        if (parsed.hostname === 'youtu.be') {
            return `https://www.youtube.com/embed${parsed.pathname}`;
        }
        // Handle youtube.com/embed/ID (already embed)
        if (parsed.pathname.startsWith('/embed/')) {
            return url;
        }
    } catch {
        // invalid URL
    }
    return null;
}

export function GameInterface({ 
    gameSlug, 
    gameTitle, 
    romPath, 
    scoreConfig,
    imageUrl,
    platform,
    genre,
    originalUrl,
    description,
    isAdmin,
    youtubeUrl,
    difficultyConfig
}: GameInterfaceProps) {
    const [currentScore, setCurrentScore] = useState<number>(0);
    const [currentDifficulty, setCurrentDifficulty] = useState<number>(0);

    const handleScoreUpdate = (score: number, difficulty?: number) => {
        setCurrentScore(score);
        if (difficulty !== undefined) {
            setCurrentDifficulty(difficulty);
        }
    };

    const isPcGame = platform === 'PC';
    const embedUrl = youtubeUrl ? getYouTubeEmbedUrl(youtubeUrl) : null;

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Game Info Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="nes-container is-rounded is-dark with-title">
                        <p className="title">{gameTitle}</p>
                        {isPcGame ? (
                            embedUrl ? (
                                <div className="aspect-video w-full">
                                    <iframe
                                        src={embedUrl}
                                        className="w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title={gameTitle}
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video w-full flex items-center justify-center bg-black/50 border-4 border-c64-border">
                                    <img 
                                        src={imageUrl} 
                                        alt={gameTitle} 
                                        className="max-h-full object-contain rendering-pixelated" 
                                    />
                                </div>
                            )
                        ) : (
                            <Emulator 
                                romPath={romPath} 
                                scoreConfig={scoreConfig} 
                                onScoreUpdate={handleScoreUpdate}
                                isAdmin={isAdmin}
                                difficultyConfig={difficultyConfig}
                            />
                        )}
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

            {!isPcGame && (
                <ScoreBoard 
                    gameSlug={gameSlug} 
                    capturedScore={currentScore}
                    isAutoTracked={!!scoreConfig}
                    currentDifficulty={currentDifficulty}
                    hasDifficultyLevels={!!difficultyConfig}
                />
            )}
        </div>
    );
}

