import { createHmac, timingSafeEqual } from 'crypto';

function getScoreSecret(): string {
  const secret = process.env.SCORE_SECRET;
  if (!secret) {
    throw new Error('SCORE_SECRET environment variable is not set');
  }
  return secret;
}

export function generateScoreHash(score: number, gameSlug: string, difficulty: number): string {
  const secret = getScoreSecret();
  const data = `${score}:${gameSlug}:${difficulty}`;
  return createHmac('sha256', secret).update(data).digest('hex');
}

export function verifyScoreHash(
  score: number,
  gameSlug: string,
  difficulty: number,
  submittedHash: string
): boolean {
  const expectedHash = generateScoreHash(score, gameSlug, difficulty);
  
  const expectedBuffer = Buffer.from(expectedHash);
  const submittedBuffer = Buffer.from(submittedHash);
  
  if (expectedBuffer.length !== submittedBuffer.length) {
    return false;
  }
  
  return timingSafeEqual(expectedBuffer, submittedBuffer);
}
