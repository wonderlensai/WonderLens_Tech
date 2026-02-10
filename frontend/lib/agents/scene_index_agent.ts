import { Agent, AgentContext } from './types'
import { dbQuery } from '@/lib/db'
import { captionFramesAndEmbed } from '@/lib/pipeline/caption_frames'
import { join } from 'path'
import { existsSync } from 'fs'

export class SceneIndexAgent implements Agent {
  name: 'scene_index_agent' = 'scene_index_agent'

  async run(ctx: AgentContext) {
    const { videoId, jobId } = ctx

    const v = await dbQuery(`select * from videos where id=$1`, [videoId])
    if (v.rowCount === 0) throw new Error('Video not found')
    const video: any = v.rows[0]

    const j = await dbQuery(`select * from jobs where id=$1`, [jobId])
    if (j.rowCount === 0) throw new Error('Job not found')
    const job: any = j.rows[0]

    const framesDir = join(process.cwd(), '..', video.frames_path || '')
    if (!video.frames_path || !existsSync(framesDir)) {
      throw new Error('Frames missing on server')
    }

    const state = job.state || {}
    const frameFiles = Array.isArray(state.frameFiles) ? state.frameFiles : []
    if (!frameFiles.length) throw new Error('No frames available for captioning')

    await captionFramesAndEmbed({
      videoId,
      jobId,
      framesAbsDir: framesDir,
      frameFiles,
      fpsExtracted: Number(video.frames_fps) || 1,
      durationSec: video.duration_sec ?? null,
    })

    return { ok: true, name: this.name }
  }
}

