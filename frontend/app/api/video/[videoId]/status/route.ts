import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/db'
import { join } from 'path'
import { stat } from 'fs/promises'
import { existsSync } from 'fs'

export const runtime = 'nodejs'

function num(x: any) {
  const n = Number(x)
  return Number.isFinite(n) ? n : 0
}

function extractUsage(u: any) {
  if (!u) return null
  const prompt = u.prompt_tokens ?? u.input_tokens ?? u.promptTokens
  const completion = u.completion_tokens ?? u.output_tokens ?? u.completionTokens
  const total = u.total_tokens ?? u.totalTokens ?? (prompt != null && completion != null ? prompt + completion : undefined)
  const out: any = {}
  if (prompt != null) out.prompt_tokens = Number(prompt)
  if (completion != null) out.completion_tokens = Number(completion)
  if (total != null) out.total_tokens = Number(total)
  return Object.keys(out).length ? out : null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { videoId: string } }
) {
  const videoId = params.videoId

  const videoRes = await dbQuery(
    `select * from videos where id = $1`,
    [videoId]
  )
  if (videoRes.rowCount === 0) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  const jobRes = await dbQuery(
    `select * from jobs where video_id = $1 order by created_at desc limit 1`,
    [videoId]
  )

  const eventsRes = await dbQuery(
    `select ts, level, step, message, duration_ms, data
     from job_events
     where job_id = $1
     order by ts desc
     limit 200`,
    [jobRes.rows[0]?.id ?? null]
  )

  const chunkCountsRes = await dbQuery(
    `select chunk_type, count(*)::int as count
     from video_chunks
     where video_id = $1
     group by chunk_type`,
    [videoId]
  )

  // Compute frame storage size (best-effort, local filesystem only).
  let framesBytes: number | null = null
  try {
    const video = videoRes.rows[0] as any
    const framesRel = video.frames_path as string | null
    const state = jobRes.rows[0]?.state as any
    const frameFiles: string[] = Array.isArray(state?.frameFiles) ? state.frameFiles : []

    if (framesRel) {
      const framesDir = join(process.cwd(), '..', framesRel)
      if (existsSync(framesDir) && frameFiles.length) {
        let total = 0
        for (const f of frameFiles) {
          try {
            const s = await stat(join(framesDir, f))
            total += s.size
          } catch {}
        }
        framesBytes = total
      }
    }
  } catch {}

  // Aggregate metrics from events (latency + tokens).
  const byStep: Record<string, { count: number; durationMs: number; tokens: { prompt: number; completion: number; total: number } }> = {}
  let openaiTotals = { prompt: 0, completion: 0, total: 0, calls: 0 }

  for (const e of eventsRes.rows as any[]) {
    const step = String(e.step || 'unknown')
    const dur = e.duration_ms != null ? num(e.duration_ms) : 0
    const usage = extractUsage(e.data?.usage)
    if (!byStep[step]) {
      byStep[step] = { count: 0, durationMs: 0, tokens: { prompt: 0, completion: 0, total: 0 } }
    }
    byStep[step].count += 1
    byStep[step].durationMs += dur
    if (usage) {
      byStep[step].tokens.prompt += num(usage.prompt_tokens)
      byStep[step].tokens.completion += num(usage.completion_tokens)
      byStep[step].tokens.total += num(usage.total_tokens)
      openaiTotals.prompt += num(usage.prompt_tokens)
      openaiTotals.completion += num(usage.completion_tokens)
      openaiTotals.total += num(usage.total_tokens)
      openaiTotals.calls += 1
    }
  }

  return NextResponse.json({
    video: videoRes.rows[0],
    job: jobRes.rows[0] ?? null,
    events: eventsRes.rows,
    chunkCounts: chunkCountsRes.rows,
    metrics: {
      framesBytes,
      openaiTotals,
      byStep,
    },
  })
}
