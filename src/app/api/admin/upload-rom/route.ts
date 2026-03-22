import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireAdminAuth } from '@/lib/admin-auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.d64', '.t64', '.prg', '.tap', '.crt', '.sid'];

export async function POST(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate extension
    const originalName = file.name;
    const ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
            { error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
            { status: 400 }
        );
    }

    // Validate MIME type removed - relying on extension check is safer for obscure ROM formats

    // Sanitize filename
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    let pathUrl = "";

    if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(`roms/${safeName}`, file, {
            access: 'public',
            addRandomSuffix: true
        });
        pathUrl = blob.url;
    } else {
        if (process.env.NEXT_RUNTIME !== 'edge') {
            const { saveToLocal } = await import('@/lib/storage-node');
            pathUrl = await saveToLocal(file, safeName);
        } else {
            return NextResponse.json({ error: 'Local storage fallback not supported on Edge. Please configure BLOB_READ_WRITE_TOKEN.' }, { status: 501 });
        }
    }

    return NextResponse.json({ 
        success: true, 
        message: 'ROM uploaded successfully',
        path: pathUrl
    });

  } catch (error: unknown) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
