import { dbQuery } from './db'

export async function jobEvent(params: {
  jobId: string
  level?: 'info' | 'warn' | 'error'
  step?: string
  message: string
  durationMs?: number
  data?: any
}) {
  const { jobId, level = 'info', step, message, durationMs, data = {} } = params
  await dbQuery(
    `insert into job_events (job_id, level, step, message, duration_ms, data)
     values ($1, $2, $3, $4, $5, $6::jsonb)`,
    [jobId, level, step ?? null, message, durationMs ?? null, JSON.stringify(data)]
  )
}

export async function withTiming<T>(fn: () => Promise<T>) {
  const start = Date.now()
  try {
    const out = await fn()
    return { out, durationMs: Date.now() - start }
  } catch (err) {
    const durationMs = Date.now() - start
    ;(err as any).durationMs = durationMs
    throw err
  }
}

