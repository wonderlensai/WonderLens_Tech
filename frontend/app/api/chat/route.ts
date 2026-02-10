import { NextRequest, NextResponse } from 'next/server'
import { dbQuery } from '@/lib/db'
import { toPgVector } from '@/lib/pgvector'
import OpenAI from 'openai'
import { v4 as uuidv4 } from 'uuid'

export const runtime = 'nodejs'

const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini'
const EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small'

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set')
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

function chatSamplingParams(model: string) {
  // GPT-5 family models can reject non-default temperature; omit sampling params.
  if (/^gpt-5/i.test(model)) return {}
  return { temperature: 0.2 }
}

function completionTokenParams(model: string, n: number) {
  // Prefer `max_completion_tokens` universally (works with newer models; avoids `max_tokens` issues).
  return { max_completion_tokens: n }
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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.videoId || !body?.question) {
    return NextResponse.json({ error: 'videoId and question are required' }, { status: 400 })
  }

  const videoId = String(body.videoId)
  const question = String(body.question).trim()
  const threadId = body.threadId ? String(body.threadId) : null

  const client = getOpenAI()
  const start = Date.now()
  const requestTimeoutMs = Number(process.env.OPENAI_REQUEST_TIMEOUT_MS || 15000)

  const qEmb = await client.embeddings.create({
    model: EMBED_MODEL,
    input: question,
  })
  const qVec = qEmb.data[0].embedding
  const qVecSql = toPgVector(qVec)

  // Vector retrieval (cosine distance). pgvector uses "<=>" for cosine distance.
  const retrieved = await dbQuery(
    `select id, chunk_type, start_ts_sec, end_ts_sec, content,
            (embedding <=> $2::vector) as distance
     from video_chunks
     where video_id = $1 and embedding is not null
     order by embedding <=> $2::vector asc
     limit 12`,
    [videoId, qVecSql]
  )

  const context = retrieved.rows
    .map((r: any) => {
      const ts =
        r.start_ts_sec != null || r.end_ts_sec != null
          ? `[${r.chunk_type} ${r.start_ts_sec ?? '?'}s-${r.end_ts_sec ?? '?'}s]`
          : `[${r.chunk_type}]`
      return `${ts} ${r.content}`
    })
    .join('\n')

  const system = `You answer questions about a single uploaded video.
Use ONLY the provided context (transcript chunks, frame_caption chunks, and summary chunks).
If the context is insufficient (e.g., no frame captions for visual questions), say what's missing and which processing step to run.
When possible, cite relevant time ranges as seconds (start-end).
If asked to count things (e.g., people), aggregate counts from frame_caption chunks and mention uncertainty. Keep answers concise.`

  if (logEnabled()) {
    console.log(
      `[chat] OpenAI -> send model=${CHAT_MODEL} qChars=${question.length} ctxChars=${context.length} retrieved=${retrieved.rows.length} timeoutMs=${requestTimeoutMs}`
    )
  }

  const completion = await withTimeout(
    client.chat.completions.create({
      model: CHAT_MODEL,
      ...chatSamplingParams(CHAT_MODEL),
      ...completionTokenParams(CHAT_MODEL, 700),
      presence_penalty: 0,
      frequency_penalty: 0,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Question: ${question}\n\nContext:\n${context}` },
      ],
    } as any),
    requestTimeoutMs,
    'OpenAI chat'
  )

  const answer = completion.choices[0]?.message?.content?.trim() || ''
  const durationMs = Date.now() - start
  const usage = (completion as any).usage ?? null

  if (logEnabled()) {
    const finish = (completion as any).choices?.[0]?.finish_reason
    const respId = (completion as any).id
    console.log(
      `[chat] OpenAI <- recv id=${respId || 'n/a'} finish=${finish || 'n/a'} ms=${durationMs} chars=${answer.length}` +
        (usage ? ` usage=${JSON.stringify(usage)}` : '')
    )
  }

  // Persist chat (minimal; threads optional).
  let effectiveThreadId = threadId
  if (!effectiveThreadId) {
    effectiveThreadId = uuidv4()
    await dbQuery(
      `insert into chat_threads (id, video_id) values ($1, $2)`,
      [effectiveThreadId, videoId]
    )
  }

  await dbQuery(
    `insert into chat_messages (thread_id, role, content, duration_ms, retrieved)
     values ($1, 'user', $2, null, '[]'::jsonb)`,
    [effectiveThreadId, question]
  )
  await dbQuery(
    `insert into chat_messages (thread_id, role, content, duration_ms, retrieved)
     values ($1, 'assistant', $2, $3, $4::jsonb)`,
    [effectiveThreadId, answer, durationMs, JSON.stringify(retrieved.rows)]
  )

  return NextResponse.json({
    threadId: effectiveThreadId,
    answer,
    durationMs,
    retrieved: retrieved.rows,
    llm: {
      model: CHAT_MODEL,
      usage,
    },
  })
}
