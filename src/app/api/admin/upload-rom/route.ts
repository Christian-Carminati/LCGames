import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

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
    const path = join(process.cwd(), 'public/roms', safeName);

    await writeFile(path, buffer);

    return NextResponse.json({ 
        success: true, 
        message: 'ROM uploaded successfully',
        path: `/roms/${safeName}`
    });

  } catch (error: unknown) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
