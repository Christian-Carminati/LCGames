-- Migration: Add published field to Game model
-- Created: 2026-04-08

ALTER TABLE "Game" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true;