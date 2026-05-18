import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { ScoreIdSchema, ScoreDifficultySchema } from '@/lib/validations';
import { softDeleteScore, updateScoreDifficulty } from '@/lib/scores';
import { logAction } from '@/lib/audit';

export async function DELETE(request: NextRequest) {
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    try {
        const body = await request.json();

        const result = ScoreIdSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { scoreId } = result.data;

        await softDeleteScore(scoreId);
        await logAction({
            action: 'DELETE_SCORE',
            entityType: 'Score',
            entityId: scoreId,
            adminId: 'admin',
        });

        return NextResponse.json({ success: true });

    } catch (e) {
        console.error("Failed to soft delete score:", e);
        return NextResponse.json({ error: 'Failed to delete score' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    try {
        const body = await request.json();

        const result = ScoreDifficultySchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { scoreId, difficulty } = result.data;

        const oldScore = await prisma.score.findUnique({ where: { id: scoreId } });
        const updated = await updateScoreDifficulty(scoreId, difficulty);

        await logAction({
            action: 'UPDATE_DIFFICULTY',
            entityType: 'Score',
            entityId: scoreId,
            adminId: 'admin',
            oldValue: oldScore ? { difficulty: oldScore.difficulty } : undefined,
            newValue: { difficulty },
        });

        return NextResponse.json({ success: true, score: updated });

    } catch (e) {
        console.error("Failed to update score difficulty:", e);
        return NextResponse.json({ error: 'Failed to update score difficulty' }, { status: 500 });
    }
}
