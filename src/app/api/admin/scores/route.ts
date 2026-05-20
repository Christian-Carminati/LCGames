import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { ScoreIdSchema, ScoreDifficultySchema } from '@/lib/validations';

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

        await prisma.score.delete({
            where: { id: scoreId }
        });
        
        return NextResponse.json({ success: true });

    } catch (e) {
        console.error("Failed to delete score:", e);
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

        const updated = await prisma.score.update({
            where: { id: scoreId },
            data: { difficulty }
        });
        
        return NextResponse.json({
            success: true,
            score: {
                ...updated,
                value: Number(updated.value)
            }
        });

    } catch (e) {
        console.error("Failed to update score difficulty:", e);
        return NextResponse.json({ error: 'Failed to update score difficulty' }, { status: 500 });
    }
}
