import { z } from 'zod';

export const ScoreConfigSchema = z.object({
  address: z.string().regex(/^0x[0-9a-fA-F]+$/, 'Must be hex like 0x0800'),
  type: z.enum(['byte', 'int', 'bcd', 'string', 'digits']),
  length: z.number().int().min(1).max(8),
  baseOffset: z.string().regex(/^0x[0-9a-fA-F]+$/).optional(),
  endianness: z.enum(['big', 'little']).optional(),
  multiplier: z.number().int().min(1).optional(),
});

export const DifficultyConfigSchema = z.object({
  address: z.string().regex(/^0x[0-9a-fA-F]+$/),
  baseOffset: z.string().regex(/^0x[0-9a-fA-F]+$/).optional(),
  numLevels: z.number().int().min(1).max(20).optional(),
  levelNames: z.union([z.string(), z.array(z.string())]).optional(),
}).nullish();

export const PalNtscConfigSchema = z.object({
  address: z.string().regex(/^0x[0-9a-fA-F]+$/),
  baseOffset: z.string().regex(/^0x[0-9a-fA-F]+$/).optional(),
  numStandards: z.number().int().min(1).max(2).optional(),
}).nullish();

export const GameSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(1000).optional(),
  platform: z.enum(['C64 LC-Games', 'C64 Arcade', 'PC', 'Amiga', 'Other']),
  genre: z.string().max(50).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  url: z.string().url().optional().or(z.literal('')),
  romPath: z.string().optional(),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  scoreConfig: ScoreConfigSchema.nullish(),
  difficultyConfig: DifficultyConfigSchema,
  palNtscConfig: PalNtscConfigSchema,
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
