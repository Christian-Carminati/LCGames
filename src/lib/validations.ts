import { z } from 'zod';

export const GameSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(1000).optional(),
  platform: z.enum(['C64 LC-Games', 'C64 Arcade', 'NES', 'PC', 'Amiga', 'Other']),
  genre: z.string().max(50).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  url: z.string().url().optional().or(z.literal('')),
  romPath: z.string().optional(),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  scoreConfig: z.record(z.string(), z.unknown()).nullish(),
  difficultyConfig: z.record(z.string(), z.unknown()).nullish(),
  palNtscConfig: z.record(z.string(), z.unknown()).nullish(),
  published: z.boolean().optional(),
}).transform(data => ({
  ...data,
  platform: data.platform || 'C64 LC-Games' as const
}));

export const ScoreSubmitSchema = z.object({
  gameSlug: z.string().min(1),
  score: z.number().int().min(0).max(999999999),
  difficulty: z.number().int().min(0).max(10),
  hash: z.string().length(64),
});

export const LoginSchema = z.object({
  password: z.string().min(1),
});

export const ScoreIdSchema = z.object({
  scoreId: z.string().min(1),
});

export const ScoreDifficultySchema = z.object({
  scoreId: z.string().min(1),
  difficulty: z.number().int().min(0).max(10),
});
