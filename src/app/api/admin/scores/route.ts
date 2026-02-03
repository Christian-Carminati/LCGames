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
