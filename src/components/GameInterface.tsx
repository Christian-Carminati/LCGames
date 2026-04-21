'use client';

import { useState, useEffect, useRef } from 'react';
import { Emulator } from '@/components/Emulator';
import { ScoreBoard } from '@/components/ScoreBoard';
import { CurrentScoreCard } from '@/components/CurrentScoreCard';
import { SaveScorePrompt } from '@/components/SaveScorePrompt';

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
    difficultyConfig?: { address: string; baseOffset?: string; numLevels?: number; levelNames?: string[] };
    palNtscConfig?: { address: string; baseOffset?: string; numStandards?: number };
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

// Check if warp settings are enabled in localStorage
function checkWarpSettings(romPath: string | null): { enabled: boolean; missing: string[] } {
    if (typeof window === 'undefined' || !romPath) {
        return { enabled: true, missing: [] };
    }
    
    const settingsKey = `ejs-1-c64-${romPath}-settings`;
    try {
        const settings = JSON.parse(localStorage.getItem(settingsKey) || '{}');
        const missing: string[] = [];
        
        // Fast loading settings (these affect load speed)
        if (settings.settings?.vice_autoloadwarp !== 'enabled') {
            missing.push('vice_autoloadwarp (auto-enable warp during loading)');
        }
        if (settings.settings?.vice_warp_boost !== 'enabled') {
            missing.push('vice_warp_boost (warp speed boost)');
        }
        if (settings.settings?.vice_drive_true_emulation !== 'disabled') {
            missing.push('vice_drive_true_emulation (should be disabled for faster loading)');
        }
        if (settings.settings?.vsync !== 'disabled') {
            missing.push('vsync (should be disabled for better performance)');
        }
        
        return {
            enabled: missing.length === 0,
            missing
        };
    } catch {
        return { enabled: false, missing: ['settings not found'] };
    }
}

// Enable warp settings in localStorage
function enableWarpSettings(romPath: string | null): void {
    if (typeof window === 'undefined' || !romPath) {
        return;
    }
    
    const settingsKey = `ejs-1-c64-${romPath}-settings`;
    try {
        const existingSettings = JSON.parse(localStorage.getItem(settingsKey) || '{}');
        
        // Default C64 controller configuration
        const defaultC64Controls = {
            "0": {
                "0": { "value": 88, "value2": "BUTTON_2" },
                "1": { "value": 83, "value2": "BUTTON_4" },
                "2": { "value": 86, "value2": "SELECT" },
                "3": { "value": 13, "value2": "START" },
                "4": { "value": 38, "value2": "DPAD_UP" },
                "5": { "value": 40, "value2": "DPAD_DOWN" },
                "6": { "value": 37, "value2": "DPAD_LEFT" },
                "7": { "value": 39, "value2": "DPAD_RIGHT" },
                "8": { "value": 90, "value2": "BUTTON_1" },
                "9": { "value": 65, "value2": "BUTTON_3" },
                "10": { "value": 81, "value2": "LEFT_TOP_SHOULDER" },
                "11": { "value": 69, "value2": "RIGHT_TOP_SHOULDER" },
                "12": { "value": 9, "value2": "LEFT_BOTTOM_SHOULDER" },
                "13": { "value": 82, "value2": "RIGHT_BOTTOM_SHOULDER" },
                "14": { "value": 0, "value2": "LEFT_STICK" },
                "15": { "value": 0, "value2": "RIGHT_STICK" },
                "16": { "value": 72, "value2": "LEFT_STICK_X:+1" },
                "17": { "value": 70, "value2": "LEFT_STICK_X:-1" },
                "18": { "value": 71, "value2": "LEFT_STICK_Y:+1" },
                "19": { "value": 84, "value2": "LEFT_STICK_Y:-1" },
                "20": { "value": 76, "value2": "RIGHT_STICK_X:+1" },
                "21": { "value": 74, "value2": "RIGHT_STICK_X:-1" },
                "22": { "value": 75, "value2": "RIGHT_STICK_Y:+1" },
                "23": { "value": 73, "value2": "RIGHT_STICK_Y:-1" },
                "24": { "value": 49 },
                "25": { "value": 50 },
                "26": { "value": 51 },
                "27": { "value": 0 },
                "28": { "value": 0 },
                "29": { "value": 0 }
            },
            "1": {},
            "2": {},
            "3": {}
        };
        
        // Create complete settings structure if missing
        if (!existingSettings.controlSettings || !existingSettings.controlSettings["0"]?.["0"]) {
            existingSettings.controlSettings = defaultC64Controls;
            existingSettings.cheats = [];
        }
        
        // Force warp settings
        existingSettings.settings = {
            ...(existingSettings.settings || {}),
            vsync: "disabled",
            vice_autoloadwarp: "enabled",
            vice_warp_boost: "enabled",
            vice_drive_true_emulation: "disabled",
            shader: "crt-easymode.glslp",
        };
        
        localStorage.setItem(settingsKey, JSON.stringify(existingSettings));
        console.log('[GAME_INTERFACE] Warp settings enabled for:', romPath);
    } catch (e) {
        console.error('[GAME_INTERFACE] Failed to enable warp settings:', e);
    }
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
    difficultyConfig,
    palNtscConfig
}: GameInterfaceProps) {
    const [currentScore, setCurrentScore] = useState<number>(0);
    const [currentDifficulty, setCurrentDifficulty] = useState<number>(0);
    const [currentStandard, setCurrentStandard] = useState<'PAL' | 'NTSC'>('PAL');
    const [warpStatus, setWarpStatus] = useState<{ enabled: boolean; missing: string[] }>({ enabled: true, missing: [] });
    const [scoreRefreshKey, setScoreRefreshKey] = useState<number>(0);
    const [lastSavedScore, setLastSavedScore] = useState<{ score: number; difficulty: number; standard: 'PAL' | 'NTSC' } | null>(null);
    const [peakScorePrompt, setPeakScorePrompt] = useState<{ score: number; difficulty: number; standard: 'PAL' | 'NTSC' } | null>(null);
    // Frozen values at game-over moment (cannot be changed after)
    const [frozenDifficulty, setFrozenDifficulty] = useState<number>(0);
    const [frozenStandard, setFrozenStandard] = useState<'PAL' | 'NTSC'>('PAL');
    const scoreBoardRef = useRef<HTMLDivElement>(null);

    const handleScoreUpdate = (score: number, difficulty?: number, standard?: 'PAL' | 'NTSC') => {
        setCurrentScore(score);
        if (difficulty !== undefined) {
            setCurrentDifficulty(difficulty);
        }
        if (standard) {
            setCurrentStandard(standard);
        }
    };

    const handlePalNtscUpdate = (standard: 'PAL' | 'NTSC') => {
        setCurrentStandard(standard);
    };

    const handleScoreSaved = () => {
        setLastSavedScore({ score: currentScore, difficulty: currentDifficulty, standard: currentStandard });
        setScoreRefreshKey((prev) => prev + 1);
        setTimeout(() => {
            scoreBoardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const isC64 = platform === 'C64 LC-Games' || platform === 'C64 Arcade' || platform === 'C64' || platform === 'COMMODORE 64';

    // Check warp settings on mount
    useEffect(() => {
        if (isC64) {
            const status = checkWarpSettings(romPath);
            setWarpStatus(status);
        }
    }, [romPath, isC64]);

    // Handle SCORE_DROP_DETECTED from emulator
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'SCORE_DROP_DETECTED' && typeof event.data.peakScore === 'number') {
                if (event.data.peakScore > 0 && !lastSavedScore) {
                    // Freeze difficulty and standard at game-over moment
                    setFrozenDifficulty(currentDifficulty);
                    setFrozenStandard(currentStandard);
                    setPeakScorePrompt({
                        score: event.data.peakScore,
                        difficulty: currentDifficulty,
                        standard: currentStandard
                    });
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [lastSavedScore, currentDifficulty, currentStandard]);

    const isVideoOnlyGame = platform === 'PC' || (typeof platform === 'string' && platform.toUpperCase() === 'AMIGA' && !!youtubeUrl);
    const embedUrl = youtubeUrl ? getYouTubeEmbedUrl(youtubeUrl) : null;

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Game Info Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="nes-container is-rounded is-dark with-title">
                        <p className="title">{gameTitle}</p>
                        {isVideoOnlyGame ? (
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
                                palNtscConfig={palNtscConfig}
                                onPalNtscUpdate={handlePalNtscUpdate}
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

                    {isAdmin && (
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
                    )}
                </div>
            </div>

            {!isVideoOnlyGame && scoreConfig && (
                <div ref={scoreBoardRef} className="flex flex-col gap-6">
                    <CurrentScoreCard
                        gameSlug={gameSlug}
                        capturedScore={currentScore}
                        hasDifficultyLevels={!!difficultyConfig}
                        currentDifficulty={currentDifficulty}
                        difficultyNames={difficultyConfig?.levelNames || []}
                        hasPalNtsc={!!palNtscConfig}
                        currentStandard={currentStandard}
                        numDifficultyLevels={difficultyConfig?.numLevels || 1}
                        romPath={romPath}
                        onScoreSaved={handleScoreSaved}
                    />
                    <ScoreBoard
                        gameSlug={gameSlug}
                        hasDifficultyLevels={!!difficultyConfig}
                        numDifficultyLevels={difficultyConfig?.numLevels || 1}
                        difficultyNames={difficultyConfig?.levelNames || []}
                        hasPalNtsc={!!palNtscConfig}
                        currentStandard={currentStandard}
                        refreshKey={scoreRefreshKey}
                        lastSavedScore={lastSavedScore}
                    />
                </div>
            )}

            {!isVideoOnlyGame && !scoreConfig && (
                <div ref={scoreBoardRef}>
                    <ScoreBoard
                        gameSlug={gameSlug}
                        hasDifficultyLevels={!!difficultyConfig}
                        numDifficultyLevels={difficultyConfig?.numLevels || 1}
                        difficultyNames={difficultyConfig?.levelNames || []}
                        hasPalNtsc={!!palNtscConfig}
                        currentStandard={currentStandard}
                        refreshKey={scoreRefreshKey}
                        lastSavedScore={lastSavedScore}
                    />
                </div>
            )}

            {peakScorePrompt && (
                <SaveScorePrompt
                    peakScore={peakScorePrompt.score}
                    gameSlug={gameSlug}
                    difficulty={peakScorePrompt.difficulty}
                    standard={peakScorePrompt.standard}
                    romPath={romPath}
                    onDismiss={() => {
                        setPeakScorePrompt(null);
                        setCurrentScore(0);
                    }}
                    onSaveSuccess={() => {
                        setLastSavedScore({ score: peakScorePrompt.score, difficulty: peakScorePrompt.difficulty, standard: peakScorePrompt.standard });
                        setScoreRefreshKey(prev => prev + 1);
                        setPeakScorePrompt(null);
                        setCurrentScore(0);
                    }}
                />
            )}
        </div>
    );
}

