import OpenAI from 'openai'
import { readFile } from 'fs/promises'
import { extname, join } from 'path'
import { dbQuery } from '@/lib/db'
import { jobEvent, withTiming } from '@/lib/telemetry'
import { toPgVector } from '@/lib/pgvector'

// Default vision model for frame understanding.
const VISION_MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-4.1-nano'
const EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small'

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set')
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

function isGpt5(model: string) {
  return /^gpt-5/i.test(model)
}

function samplingParams(model: string) {
  // GPT-5 mini rejects non-default temperature; omit to use defaults.
  if (isGpt5(model)) return {}
  return { temperature: 0.2 }
}

function completionTokenParams(_model: string, n: number) {
  // Prefer `max_completion_tokens` universally (works with newer models; avoids `max_tokens` issues).
  return { max_completion_tokens: n }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function withTimeout<T>(p: PromiseLike<T>, ms: number, label: string) {
  return Promise.race<T>([
    Promise.resolve(p as any),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms)
    ),
  ])
}

function logEnabled() {
  const lvl = (process.env.OPENAI_LOG_LEVEL || 'info').toLowerCase()
  return lvl === 'info' || lvl === 'debug'
}

function logDebugEnabled() {
  return (process.env.OPENAI_LOG_LEVEL || '').toLowerCase() === 'debug'
}

function extractAssistantText(resp: any) {
  const msg = resp?.choices?.[0]?.message
  if (!msg) return { text: '', kind: 'missing_message' as const }

  const c = msg.content
  if (typeof c === 'string') return { text: c, kind: 'string' as const }

  // Some models may return an array of content parts.
  if (Array.isArray(c)) {
    const parts: string[] = []
    for (const p of c) {
      if (!p) continue
      if (typeof p === 'string') parts.push(p)
      else if (p.type === 'text' && typeof p.text === 'string') parts.push(p.text)
      else if (typeof p.text === 'string') parts.push(p.text)
    }
    return { text: parts.join('\n'), kind: 'parts' as const }
  }

  if (typeof msg.refusal === 'string' && msg.refusal) {
    return { text: '', kind: 'refusal' as const }
  }

  return { text: '', kind: typeof c as any }
}

async function withRateLimitRetry<T>(
  fn: () => PromiseLike<T>,
  onRetry?: (info: { attempt: number; waitMs: number; message: string }) => Promise<void>
) {
  const maxAttempts = 6
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      const status = err?.status
      if (status !== 429 || attempt === maxAttempts) throw err

      const raMs = Number(err?.headers?.['retry-after-ms'])
      const raSec = Number(err?.headers?.['retry-after'])
      const waitMs = Number.isFinite(raMs) ? raMs : Number.isFinite(raSec) ? raSec * 1000 : 800 * attempt
      const message = err?.error?.message || err?.message || 'rate_limit_exceeded'

      if (onRetry) await onRetry({ attempt, waitMs, message })
      await sleep(waitMs)
    }
  }
  // Unreachable
  throw new Error('withRateLimitRetry: exhausted')
}

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function pickEvenly<T>(arr: T[], maxItems: number) {
  if (arr.length <= maxItems) return arr
  const out: T[] = []
  const step = (arr.length - 1) / (maxItems - 1)
  for (let i = 0; i < maxItems; i++) {
    out.push(arr[Math.round(i * step)])
  }
  return out
}

function frameIndexFromName(name: string) {
  // frame_0001.jpg -> 1
  const m = name.match(/^frame_(\d+)\./)
  return m ? parseInt(m[1], 10) : null
}

function tsForFrame(frameName: string, fpsExtracted: number) {
  const idx = frameIndexFromName(frameName)
  if (!idx || !fpsExtracted) return null
  // idx=1 is the first extracted frame, treat as t=0.
  return (idx - 1) / fpsExtracted
}

function safeJsonParse(s: string) {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}

export async function captionFramesAndEmbed(params: {
  videoId: string
  jobId: string
  framesAbsDir: string
  frameFiles: string[]
  fpsExtracted: number
  maxFrames?: number
  durationSec?: number | null
}) {
  const {
    videoId,
    jobId,
    framesAbsDir,
    frameFiles,
    fpsExtracted,
    maxFrames = Number(process.env.OPENAI_MAX_CAPTION_FRAMES || 24),
    durationSec,
  } = params

  const client = getOpenAI()
  const selected = pickEvenly(frameFiles, clampInt(maxFrames, 1, 200))
  const requestTimeoutMs = Number(process.env.OPENAI_REQUEST_TIMEOUT_MS || 15000)

  await jobEvent({
    jobId,
    step: 'caption_frames',
    message: 'Captioning frames (vision)',
    data: { selected: selected.length, totalFrames: frameFiles.length, model: VISION_MODEL },
  })

  let okCount = 0
  const captions: { t: number | null; text: string }[] = []

  for (let i = 0; i < selected.length; i++) {
    const frameName = selected[i]
    const framePath = join(framesAbsDir, frameName)

    const buf = await readFile(framePath)
    const ext = extname(frameName).toLowerCase()
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg'
    const dataUrl = `data:${mime};base64,${buf.toString('base64')}`

    const prompt =
      `Return STRICT JSON only (no markdown, no extra keys) in this exact shape:\n` +
      `{"scene_summary":"...","people_count":null,"vehicles_count":null,` +
      `"notable_objects":[],"actions":[],"setting":"...","safety_issues":[]}\n` +
      `Counts must be number or null. Keep strings concise.`

    const { out: captionText, durationMs } = await withTiming(async () => {
      const onRetry = async ({ attempt, waitMs, message }: any) => {
        if (logEnabled()) {
          console.warn(
            `[${jobId}] OpenAI rate limit: attempt=${attempt} waitMs=${waitMs} frame=${frameName} msg=${message}`
          )
        }
        await jobEvent({
          jobId,
          level: 'warn',
          step: 'caption_frames',
          message: 'Rate limited; retrying',
          data: { attempt, waitMs, message, frame: frameName },
        })
      }

      if (logEnabled()) {
        console.log(
          `[${jobId}] OpenAI vision -> send model=${VISION_MODEL} frame=${frameName} imageBytes=${buf.length} promptChars=${prompt.length} timeoutMs=${requestTimeoutMs}`
        )
        if (logDebugEnabled()) {
          console.log(`[${jobId}] OpenAI vision prompt (debug): ${prompt}`)
        }
      }

      const { out: resp, durationMs: callMs } = await withTiming(async () =>
        withRateLimitRetry(
          () =>
            withTimeout(
              client.chat.completions.create({
                model: VISION_MODEL,
                ...samplingParams(VISION_MODEL),
                ...completionTokenParams(VISION_MODEL, 320),
                presence_penalty: 0,
                frequency_penalty: 0,
                messages: [
                  {
                    role: 'system',
                    content:
                      'You extract structured facts from a single video frame. Output must be STRICT JSON only.',
                  },
                  {
                    role: 'user',
                    content: [
                      { type: 'text', text: prompt },
                      { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
                    ] as any,
                  },
                ],
              } as any),
              requestTimeoutMs,
              'OpenAI vision'
            ),
          onRetry
        )
      )

      const { text: rawText, kind } = extractAssistantText(resp as any)
      const content = (rawText || '').trim()
      const usage = (resp as any).usage
      const finish = (resp as any).choices?.[0]?.finish_reason
      const respId = (resp as any).id

      if (logEnabled()) {
        console.log(
          `[${jobId}] OpenAI vision <- recv id=${respId || 'n/a'} finish=${finish || 'n/a'} ms=${callMs} chars=${content.length} kind=${kind}` +
            (usage ? ` usage=${JSON.stringify(usage)}` : '')
        )
      }

      if (!content) {
        // Avoid silently indexing empty chunks.
        throw new Error(`OpenAI returned empty content (finish=${finish || 'n/a'}, kind=${kind})`)
      }

      await jobEvent({
        jobId,
        step: 'openai_vision',
        message: 'Vision frame caption',
        durationMs: callMs,
        data: {
          model: VISION_MODEL,
          frame: frameName,
          imageBytes: buf.length,
          finish,
          respId,
          usage: usage ?? null,
        },
      })

      return content
    })

    const parsed = safeJsonParse(captionText)
    const t = tsForFrame(frameName, fpsExtracted)

    const asText =
      parsed
        ? [
            `scene_summary: ${parsed.scene_summary ?? ''}`,
            `people_count: ${parsed.people_count ?? 'null'}`,
            `vehicles_count: ${parsed.vehicles_count ?? 'null'}`,
            `setting: ${parsed.setting ?? ''}`,
            `notable_objects: ${(parsed.notable_objects || []).join(', ')}`,
            `actions: ${(parsed.actions || []).join(', ')}`,
            `safety_issues: ${(parsed.safety_issues || []).join(', ')}`,
          ].join('\n')
        : captionText

    await dbQuery(
      `insert into video_chunks (video_id, chunk_type, start_ts_sec, end_ts_sec, content)
       values ($1, 'frame_caption', $2, $3, $4)`,
      [videoId, t, t, asText]
    )

    captions.push({ t: t ?? null, text: asText })
    okCount++

    if ((i + 1) % 10 === 0 || i === selected.length - 1) {
      await jobEvent({
        jobId,
        step: 'caption_frames',
        message: 'Caption progress',
        durationMs,
        data: { done: i + 1, total: selected.length, lastFrame: frameName },
      })
    }
  }

  // Embed newly added frame_caption chunks.
  const toEmbed = await dbQuery(
    `select id, content from video_chunks
     where video_id = $1 and chunk_type = 'frame_caption' and embedding is null
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

    await jobEvent({
      jobId,
      step: 'openai_embed',
      message: 'Embedded frame captions',
      durationMs: embMs,
      data: {
        model: EMBED_MODEL,
        count: inputs.length,
        usage: (emb as any).usage ?? null,
      },
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
      message: 'Embedded frame captions',
      durationMs: embMs,
      data: { count: inputs.length, model: EMBED_MODEL },
    })
  }

  // Create a compact whole-video visual summary.
  const summaryInput = captions
    .slice(0, 200)
    .map((c) => (c.t == null ? `[t=?] ${c.text}` : `[t=${c.t.toFixed(1)}s] ${c.text}`))
    .join('\n\n')

  const { out: summaryOut, durationMs: sumMs } = await withTiming(async () => {
    const text =
      `Write:\n` +
      `1) a 3-6 bullet "what happens" summary\n` +
      `2) a list of key entities (people/vehicles/objects)\n` +
      `3) any safety/security issues observed\n\n` +
      `Captions:\n${summaryInput}`

    if (logEnabled()) {
      console.log(
        `[${jobId}] OpenAI summary -> send model=${VISION_MODEL} inputChars=${text.length} timeoutMs=${requestTimeoutMs}`
      )
    }

    const resp = await withRateLimitRetry(() =>
      withTimeout(
        client.chat.completions.create({
          model: VISION_MODEL,
          ...samplingParams(VISION_MODEL),
          ...completionTokenParams(VISION_MODEL, 500),
          presence_penalty: 0,
          frequency_penalty: 0,
          messages: [
            {
              role: 'system',
              content:
                'Summarize the visual content of a video from per-frame captions. Be specific and concise.',
            },
            { role: 'user', content: text },
          ],
        } as any),
        requestTimeoutMs,
        'OpenAI summary'
      )
    )

    const { text: rawText, kind } = extractAssistantText(resp as any)
    const content = (rawText || '').trim()
    const usage = (resp as any).usage
    const finish = (resp as any).choices?.[0]?.finish_reason
    const respId = (resp as any).id

    if (logEnabled()) {
      console.log(
        `[${jobId}] OpenAI summary <- recv id=${respId || 'n/a'} finish=${finish || 'n/a'} chars=${content.length} kind=${kind}` +
          (usage ? ` usage=${JSON.stringify(usage)}` : '')
      )
    }

    return {
      content,
      meta: {
        model: VISION_MODEL,
        finish,
        respId,
        usage: usage ?? null,
        inputChars: text.length,
        outputChars: content.length,
        kind,
      },
    }
  })

  const summaryText = summaryOut?.content || ''
  const summaryMeta = summaryOut?.meta || null

  if (summaryMeta) {
    await jobEvent({
      jobId,
      step: 'openai_summary',
      message: 'Visual summary',
      durationMs: sumMs,
      data: summaryMeta,
    })
  }

  if (summaryText) {
    await dbQuery(
      `insert into video_chunks (video_id, chunk_type, start_ts_sec, end_ts_sec, content)
       values ($1, 'summary', $2, $3, $4)`,
      [videoId, 0, durationSec ?? null, summaryText]
    )

    if (summaryText.trim()) {
      if (logEnabled()) {
        console.log(`[${jobId}] OpenAI embed(summary) -> send model=${EMBED_MODEL} chars=${summaryText.length}`)
      }
      const sEmb = await client.embeddings.create({ model: EMBED_MODEL, input: summaryText })
      const vec = sEmb.data[0].embedding
      await dbQuery(
        `update video_chunks set embedding = $2::vector
         where video_id=$1 and chunk_type='summary' and embedding is null`,
        [videoId, toPgVector(vec)]
      )
      await jobEvent({
        jobId,
        step: 'openai_embed',
        message: 'Embedded summary',
        data: { model: EMBED_MODEL, usage: (sEmb as any).usage ?? null, chars: summaryText.length },
      })
    }
  }

  await jobEvent({
    jobId,
    step: 'caption_frames',
    message: 'Captioning completed',
    durationMs: sumMs,
    data: { captioned: okCount, summaryChars: summaryText.length },
  })
}
