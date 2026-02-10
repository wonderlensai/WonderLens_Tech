import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { mkdir, readdir, rm } from 'fs/promises'
import { join } from 'path'
import { existsSync, createWriteStream } from 'fs'
import ffmpegStatic from 'ffmpeg-static'
import ffprobeStatic from 'ffprobe-static'
import { pipeline } from 'stream/promises'
import { Readable } from 'stream'
import { dbQuery } from '@/lib/db'
import { jobEvent, withTiming } from '@/lib/telemetry'

export const runtime = 'nodejs'
export const maxDuration = 300

const execFileAsync = promisify(execFile)
const MAX_DURATION_SEC = 300 // 5 minutes
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const FRAMES_PER_SECOND = 1 // Extract 1 frame per second

// Get paths to bundled ffmpeg/ffprobe binaries
// ffmpeg-static exports the path directly as a string
const ffmpegPath = typeof ffmpegStatic === 'string' ? ffmpegStatic : (ffmpegStatic as any)?.path || 'ffmpeg'
const ffprobePath = ffprobeStatic.path || 'ffprobe'

interface VideoMetadata {
  duration: number
  fps: number
  width: number
  height: number
  codec: string
  bitrate: number
  format: string
  fileSize: number
}

async function getVideoMetadata(filePath: string, fileSize: number): Promise<VideoMetadata> {
  try {
    // Get duration
    const { stdout: durationOut } = await execFileAsync(ffprobePath, [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath,
    ])
    const duration = parseFloat(durationOut.trim()) || 0

    // Get FPS
    const { stdout: fpsOut } = await execFileAsync(ffprobePath, [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=r_frame_rate',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath,
    ])
    const fpsStr = fpsOut.trim()
    let fps = 0
    if (fpsStr && fpsStr.includes('/')) {
      const [num, den] = fpsStr.split('/').map(Number)
      fps = den ? num / den : 0
    } else {
      fps = parseFloat(fpsStr) || 0
    }

    // Get resolution (width x height)
    const { stdout: resolutionOut } = await execFileAsync(ffprobePath, [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath,
    ])
    const resolutionLines = resolutionOut.trim().split('\n')
    const width = parseInt(resolutionLines[0] || '0', 10)
    const height = parseInt(resolutionLines[1] || '0', 10)

    // Get codec
    const { stdout: codecOut } = await execFileAsync(ffprobePath, [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=codec_name',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath,
    ])
    const codec = codecOut.trim() || 'unknown'

    // Get bitrate
    const { stdout: bitrateOut } = await execFileAsync(ffprobePath, [
      '-v',
      'error',
      '-show_entries',
      'format=bit_rate',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath,
    ])
    const bitrate = parseInt(bitrateOut.trim() || '0', 10)

    // Get format
    const { stdout: formatOut } = await execFileAsync(ffprobePath, [
      '-v',
      'error',
      '-show_entries',
      'format=format_name',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath,
    ])
    const format = formatOut.trim() || 'unknown'

    return {
      duration,
      fps: Math.round(fps * 100) / 100, // Round to 2 decimal places
      width,
      height,
      codec,
      bitrate,
      format,
      fileSize,
    }
  } catch (error: any) {
    console.error('Error getting video metadata:', error)
    throw new Error('Failed to read video metadata')
  }
}

async function extractFrames(
  videoPath: string,
  outputDir: string,
  fps: number = FRAMES_PER_SECOND
): Promise<number> {
  try {
    // Create output directory if it doesn't exist
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true })
    }

    // Extract frames using ffmpeg
    // -vf fps=1 means 1 frame per second
    // frame_%04d.jpg will create frame_0001.jpg, frame_0002.jpg, etc.
    await execFileAsync(ffmpegPath, [
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      videoPath,
      '-vf',
      `fps=${fps}`,
      '-q:v',
      '2',
      join(outputDir, 'frame_%04d.jpg'),
    ])

    // Count extracted frames
    const files = await readdir(outputDir)
    const frameCount = files.filter((file) => /^frame_\d+\.jpg$/.test(file)).length

    return frameCount
  } catch (error: any) {
    console.error('Error extracting frames:', error)
    throw new Error('Failed to extract frames from video')
  }
}

export async function POST(request: NextRequest) {
  let videoPath = ''
  let framesDir = ''
  try {
    // Parse form data
    const formData = await request.formData()
    const videoFile = formData.get('video') as File
    const question = formData.get('question') as string

    if (!videoFile) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
    }

    if (!videoFile.type || !videoFile.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a video file.' },
        { status: 400 }
      )
    }

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: 'No question provided' },
        { status: 400 }
      )
    }

    // Validate file size
    if (videoFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      )
    }

    // Generate unique video/job IDs
    const videoId = uuidv4()
    const jobId = uuidv4()
    // Data folder is at root level, go up one directory from frontend
    framesDir = join(process.cwd(), '..', 'data', 'frames', videoId)
    videoPath = join(framesDir, 'video.mp4')

    // Create directory for this upload
    await mkdir(framesDir, { recursive: true })

    // Stream uploaded file to disk to avoid buffering the whole file in memory
    const nodeStream = Readable.fromWeb(videoFile.stream() as any)
    await pipeline(nodeStream, createWriteStream(videoPath))

    console.log(`[${videoId}] Video saved, extracting metadata...`)

    // Get video metadata
    const metadata = await getVideoMetadata(videoPath, videoFile.size)

    // Basic validation to reject invalid/unsupported videos
    if (metadata.duration <= 0 || metadata.width <= 0 || metadata.height <= 0) {
      await rm(framesDir, { recursive: true, force: true }).catch(() => {})
      return NextResponse.json(
        { error: 'Invalid or unreadable video file' },
        { status: 400 }
      )
    }

    const allowedFormats = new Set(['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'])
    const formatParts = metadata.format.split(',').map((f) => f.trim().toLowerCase())
    const isAllowed = formatParts.some((f) => allowedFormats.has(f))
    if (!isAllowed) {
      await rm(framesDir, { recursive: true, force: true }).catch(() => {})
      return NextResponse.json(
        { error: `Unsupported video format (${metadata.format}). Please upload mp4, mov, avi, mkv, webm, or m4v.` },
        { status: 400 }
      )
    }
    
    // Validate video duration
    if (metadata.duration > MAX_DURATION_SEC) {
      // Clean up
      await rm(framesDir, { recursive: true, force: true }).catch(() => {})
      return NextResponse.json(
        { error: `Video duration (${metadata.duration.toFixed(1)}s) exceeds maximum allowed duration of ${MAX_DURATION_SEC} seconds` },
        { status: 400 }
      )
    }

    console.log(`[${videoId}] Metadata extracted - Duration: ${metadata.duration.toFixed(1)}s, FPS: ${metadata.fps}, Resolution: ${metadata.width}x${metadata.height}, Codec: ${metadata.codec}`)
    console.log(`[${videoId}] Extracting frames...`)

    // Extract frames
    const { out: frameCount, durationMs: extractMs } = await withTiming(() =>
      extractFrames(videoPath, framesDir, FRAMES_PER_SECOND)
    )

    // Get list of extracted frame filenames
    const frameFiles = (await readdir(framesDir))
      .filter((file) => /^frame_\d+\.jpg$/.test(file))
      .sort()

    console.log(`[${videoId}] Extracted ${frameCount} frames successfully`)

    // Create DB records (required for Level 1).
    // Note: if DATABASE_URL isn't set, this will throw and return 500.
    await dbQuery(
      `insert into videos (
        id, filename, mime_type, size_bytes,
        duration_sec, width, height, fps, codec, bitrate, format,
        frames_fps, frame_count,
        video_path, frames_path,
        status
      ) values (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9, $10, $11,
        $12, $13,
        $14, $15,
        'uploaded'
      )
      on conflict (id) do nothing`,
      [
        videoId,
        videoFile.name,
        videoFile.type,
        videoFile.size,
        metadata.duration,
        metadata.width,
        metadata.height,
        metadata.fps,
        metadata.codec,
        metadata.bitrate,
        metadata.format,
        FRAMES_PER_SECOND,
        frameCount,
        `data/frames/${videoId}/video.mp4`,
        `data/frames/${videoId}`,
      ]
    )

    await dbQuery(
      `insert into jobs (id, video_id, kind, status, step, state)
       values ($1, $2, 'ingest', 'queued', 'run_agents', $3::jsonb)
       on conflict (id) do nothing`,
      [
        jobId,
        videoId,
        JSON.stringify({
          pipeline_config: {
            version: 1,
            agents: [{ name: 'frame_caption_agent' }],
          },
          frameFiles,
          extractedAt: new Date().toISOString(),
        }),
      ]
    )

    await jobEvent({
      jobId,
      step: 'frames_extract',
      message: 'Extracted frames',
      durationMs: extractMs,
      data: { fpsExtracted: FRAMES_PER_SECOND, frameCount },
    })

    // Note: Vision processing is intentionally decoupled into /api/video/:id/process.
    // This keeps upload responsive and avoids long-running requests.

    // Return success response with metadata
    return NextResponse.json({
      videoId,
      jobId,
      metadata: {
        duration: metadata.duration,
        fps: metadata.fps,
        resolution: {
          width: metadata.width,
          height: metadata.height,
        },
        codec: metadata.codec,
        bitrate: metadata.bitrate,
        format: metadata.format,
        fileSize: metadata.fileSize,
      },
      extraction: {
        fpsExtracted: FRAMES_PER_SECOND,
        frameCount,
        framesDir: `data/frames/${videoId}`, // Return relative path, not absolute
        frameFiles, // List of frame filenames
      },
      question: question.trim(),
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    if (framesDir) {
      await rm(framesDir, { recursive: true, force: true }).catch(() => {})
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  } finally {
    // Intentionally keep `video.mp4` on disk for downstream processing (dev/local).
  }
}
