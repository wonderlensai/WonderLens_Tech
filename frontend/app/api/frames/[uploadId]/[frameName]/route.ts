import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { uploadId: string; frameName: string } }
) {
  try {
    const { uploadId, frameName } = params

    // Security: Validate uploadId and frameName to prevent path traversal
    if (!uploadId || !frameName || !/^[a-zA-Z0-9_-]+$/.test(uploadId) || !/^frame_\d+\.jpg$/.test(frameName)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // Data folder is at root level, go up one directory from frontend
    // Note: `uploadId` is now the persisted video ID (UUID).
    const framePath = join(process.cwd(), '..', 'data', 'frames', uploadId, frameName)

    // Check if file exists
    if (!existsSync(framePath)) {
      return NextResponse.json({ error: 'Frame not found' }, { status: 404 })
    }

    // Read and return the image file
    const imageBuffer = await readFile(framePath)
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error: any) {
    console.error('Error serving frame:', error)
    return NextResponse.json({ error: 'Failed to serve frame' }, { status: 500 })
  }
}
