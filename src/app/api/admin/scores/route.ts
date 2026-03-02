export const runtime = "edge";

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { scoreId } = body;

        if (!scoreId) {
             return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        await prisma.score.delete({
            where: { id: scoreId }
        });
        
        return NextResponse.json({ success: true });

    } catch (e) {
        console.error("Failed to delete score:", e);
        return NextResponse.json({ error: 'Failed to delete score' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { scoreId, difficulty } = body;

        if (!scoreId || difficulty === undefined) {
             return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const updated = await prisma.score.update({
            where: { id: scoreId },
            data: { difficulty: parseInt(difficulty, 10) }
        });
        
        return NextResponse.json({ success: true, score: updated });

    } catch (e) {
        console.error("Failed to update score difficulty:", e);
        return NextResponse.json({ error: 'Failed to update score difficulty' }, { status: 500 });
    }
}
