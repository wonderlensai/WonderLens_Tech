import { Pool } from 'pg'

let pool: Pool | null = null

function getPool() {
  if (!process.env.DATABASE_URL) return null
  if (pool) return pool

  // Hosted Postgres (Supabase/Neon/etc) typically require SSL even in local dev.
  // Also: `sslmode=require` in DATABASE_URL may be interpreted as "verify-full" by
  // pg-connection-string, which can fail on some networks with:
  // "self-signed certificate in certificate chain".
  //
  // Strategy:
  // - Detect local hosts and disable SSL.
  // - For non-local, force ssl + rejectUnauthorized:false.
  // - Strip ssl-related query params from the URL so our explicit `ssl` option wins.
  let ssl: any = undefined
  let connectionString = process.env.DATABASE_URL
  try {
    const u = new URL(process.env.DATABASE_URL)
    const host = u.hostname
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1'

    if (u.searchParams.has('sslmode')) u.searchParams.delete('sslmode')
    if (u.searchParams.has('ssl')) u.searchParams.delete('ssl')
    connectionString = u.toString()

    ssl = isLocal ? undefined : { rejectUnauthorized: false }
  } catch {
    ssl = process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  }

  pool = new Pool({
    connectionString,
    ssl,
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30_000,
  })
  return pool
}

export async function dbQuery<T = any>(text: string, params: any[] = []) {
  const p = getPool()
  if (!p) {
    throw new Error('DATABASE_URL is not set (Postgres required for Level 1 pipeline)')
  }
  const res = await p.query<T>(text, params)
  return res
}
