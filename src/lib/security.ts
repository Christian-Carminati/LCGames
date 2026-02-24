export function generateScoreHash(score: number, gameSlug: string, difficulty: number): string {
    // A simple obfuscation to deter casual tampering
    // Not cryptographically secure against a determined reverse-engineer
    const secret = process.env.NEXT_PUBLIC_SCORE_SECRET || "LCGames2024!";
    const raw = `${score}:${gameSlug}:${difficulty}:${secret}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
}
