import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/db'
import { jobEvent } from '@/lib/telemetry'
import { join } from 'path'
import { existsSync } from 'fs'
import { transcribeAndEmbed } from '@/lib/pipeline/transcribe'
import { MasterAgent } from '@/lib/agents/master_agent'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(
  _req: NextRequest,
  { params }: { params: { videoId: string } }
) {
  const videoId = params.videoId

  const jobRes = await dbQuery(
    `select * from jobs where video_id = $1 order by created_at desc limit 1`,
    [videoId]
  )
  if (jobRes.rowCount === 0) {
    return NextResponse.json({ error: 'Job not found for video' }, { status: 404 })
  }

  const job = jobRes.rows[0] as any
  const jobId = job.id as string

  const videoRes = await dbQuery(`select * from videos where id = $1`, [videoId])
  if (videoRes.rowCount === 0) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }
  const video = videoRes.rows[0] as any

  // Mark running if needed.
  if (job.status === 'queued') {
    await dbQuery(
      `update jobs set status='running', started_at=coalesce(started_at, now()), updated_at=now() where id=$1`,
      [jobId]
    )
    await jobEvent({ jobId, step: job.step, message: 'Job started' })
  }

  // Agentic pipeline runner (use-case selects sub agents).
  if (job.step === 'run_agents') {
    try {
      const state = job.state || {}
      const master = new MasterAgent()
      const pipeline = master.pipelineFromJobState(state)
      const result = await master.run(pipeline, { videoId, jobId })
      if (!result.ok) {
        await jobEvent({
          jobId,
          level: 'error',
          step: 'run_agents',
          message: 'Agent pipeline failed',
          data: { pipeline, results: result.results },
        })
        return NextResponse.json({ error: 'Agent pipeline failed', details: result.results }, { status: 500 })
      }

      await dbQuery(
        `update jobs
         set step='done', status='done', updated_at=now(), finished_at=now()
         where id=$1`,
        [jobId]
      )
      await dbQuery(`update videos set status='ready' where id=$1`, [videoId])
      await jobEvent({ jobId, step: 'done', message: 'Job completed' })

      return NextResponse.json({ ok: true, jobId, step: 'done', status: 'done', pipeline })
    } catch (err: any) {
      console.error(`[${jobId}] /process failed:`, err)
      await dbQuery(
        `update jobs set status='error', error=$2, updated_at=now(), finished_at=now() where id=$1`,
        [jobId, err?.message || 'run_agents failed']
      ).catch(() => {})
      await jobEvent({
        jobId,
        level: 'error',
        step: 'run_agents',
        message: 'Agent pipeline failed',
        data: { error: err?.message || String(err) },
      }).catch(() => {})
      return NextResponse.json({ error: err?.message || 'Agent pipeline failed' }, { status: 500 })
    }
  }

  // Audio processing (optional): transcript -> embeddings.
  if (job.step === 'transcribe') {
    const videoPath = join(process.cwd(), '..', video.video_path || '')
    if (!video.video_path || !existsSync(videoPath)) {
      await dbQuery(
        `update jobs set status='error', error=$2, updated_at=now(), finished_at=now() where id=$1`,
        [jobId, 'Video file missing on server (prod should use blob storage)']
      )
      await jobEvent({
        jobId,
        level: 'error',
        step: 'transcribe',
        message: 'Video file missing; cannot transcribe',
        data: { video_path: video.video_path },
      })
      return NextResponse.json({ error: 'Video file missing on server' }, { status: 500 })
    }

    const audioPath = join(process.cwd(), '..', 'data', 'frames', videoId, 'audio.mp3')

    await transcribeAndEmbed({
      videoId,
      jobId,
      videoAbsPath: videoPath,
      audioAbsPath: audioPath,
      durationSec: video.duration_sec ?? null,
    })
    return NextResponse.json({ ok: true, jobId, step: 'done', status: 'done' })
  }

  return NextResponse.json({ ok: true, jobId, step: job.step, status: job.status })
}
