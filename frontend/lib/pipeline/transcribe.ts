import { execFile } from 'child_process'
import { createReadStream } from 'fs'
import { rm } from 'fs/promises'
import { promisify } from 'util'
import ffmpegStatic from 'ffmpeg-static'
import OpenAI from 'openai'
import { dbQuery } from '@/lib/db'
import { jobEvent, withTiming } from '@/lib/telemetry'
import { toPgVector } from '@/lib/pgvector'

const execFileAsync = promisify(execFile)
const ffmpegPath = typeof ffmpegStatic === 'string' ? ffmpegStatic : (ffmpegStatic as any)?.path || 'ffmpeg'

const TRANSCRIBE_MODEL = process.env.OPENAI_TRANSCRIBE_MODEL || 'whisper-1'
const EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small'

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set')
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

function normalizeWhitespace(s: string) {
  return s.replace(/\s+/g, ' ').trim()
}

async function extractAudioMp3(videoPath: string, outMp3Path: string) {
  await execFileAsync(ffmpegPath, [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-i',
    videoPath,
    '-vn',
    '-ac',
    '1',
    '-ar',
    '16000',
    '-b:a',
    '64k',
    outMp3Path,
  ])
}

export async function transcribeAndEmbed(params: {
  videoId: string
  jobId: string
  videoAbsPath: string
  audioAbsPath: string
  durationSec?: number | null
}) {
  const { videoId, jobId, videoAbsPath, audioAbsPath, durationSec } = params

  const { durationMs: audioMs } = await withTiming(async () => {
    await extractAudioMp3(videoAbsPath, audioAbsPath)
  })
  await jobEvent({
    jobId,
    step: 'transcribe',
    message: 'Extracted audio',
    durationMs: audioMs,
    data: { audioPath: audioAbsPath },
  })

  const client = getOpenAI()

  const { out: tr, durationMs: trMs } = await withTiming(async () => {
    const resp = await client.audio.transcriptions.create({
      model: TRANSCRIBE_MODEL,
      file: createReadStream(audioAbsPath) as any,
      response_format: 'verbose_json' as any,
    })
    return resp as any
  })

  const segments = Array.isArray(tr.segments) ? tr.segments : []
  const fullText = normalizeWhitespace(tr.text || '')

  await jobEvent({
    jobId,
    step: 'transcribe',
    message: 'Transcribed audio',
    durationMs: trMs,
    data: { segmentCount: segments.length, chars: fullText.length },
  })

  if (segments.length === 0 && fullText) {
    await dbQuery(
      `insert into video_chunks (video_id, chunk_type, start_ts_sec, end_ts_sec, content)
       values ($1, 'transcript', $2, $3, $4)`,
      [videoId, 0, durationSec ?? null, fullText]
    )
  } else {
    for (const seg of segments) {
      const content = normalizeWhitespace(seg.text || '')
      if (!content) continue
      await dbQuery(
        `insert into video_chunks (video_id, chunk_type, start_ts_sec, end_ts_sec, content)
         values ($1, 'transcript', $2, $3, $4)`,
        [videoId, seg.start ?? null, seg.end ?? null, content]
      )
    }
  }

  const toEmbed = await dbQuery(
    `select id, content from video_chunks
     where video_id = $1 and chunk_type = 'transcript' and embedding is null
     order by id asc
     limit 500`,
    [videoId]
  )

  const inputs = toEmbed.rows.map((r: any) => r.content)
  if (inputs.length) {
    const { out: emb, durationMs: embMs } = await withTiming(async () => {
      return client.embeddings.create({
        model: EMBED_MODEL,
        input: inputs,
      })
    })

    for (let i = 0; i < toEmbed.rows.length; i++) {
      const row = toEmbed.rows[i] as any
      const vec = emb.data[i].embedding
      await dbQuery(`update video_chunks set embedding = $2::vector where id = $1`, [
        row.id,
        toPgVector(vec),
      ])
    }

    await jobEvent({
      jobId,
      step: 'embed',
      message: 'Embedded transcript chunks',
      durationMs: embMs,
      data: { count: inputs.length, model: EMBED_MODEL },
    })
  }

  await rm(audioAbsPath, { force: true }).catch(() => {})

  await dbQuery(
    `update jobs
     set step='done', status='done', updated_at=now(), finished_at=now()
     where id=$1`,
    [jobId]
  )
  await dbQuery(`update videos set status='ready' where id=$1`, [videoId])
  await jobEvent({ jobId, step: 'done', message: 'Job completed' })
}

