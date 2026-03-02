
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { put } from '@vercel/blob';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate extension
    const validExtensions = ['.d64', '.t64', '.prg', '.tap', '.crt', '.sid'];
    const originalName = file.name;
    const ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(ext)) {
        return NextResponse.json({ error: `Invalid file type. Allowed: ${validExtensions.join(', ')}` }, { status: 400 });
    }

    // Sanitize filename
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    let pathUrl = "";

    // Check if Vercel Blob token is available
    if (process.env.BLOB_READ_WRITE_TOKEN) {
        // Upload to Vercel Blob
        const blob = await put(`roms/${safeName}`, file, {
            access: 'public',
            addRandomSuffix: true
        });
        pathUrl = blob.url;
    } else {
        // Fallback to local storage (e.g. for development)
        const romsDir = join(process.cwd(), 'public/roms');
        if (!existsSync(romsDir)) {
           await mkdir(romsDir, { recursive: true });
        }
        const localPath = join(romsDir, safeName);
        await writeFile(localPath, buffer);
        pathUrl = `/roms/${safeName}`;
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
