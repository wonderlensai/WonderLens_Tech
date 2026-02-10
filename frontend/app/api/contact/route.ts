import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const topic = String(body?.topic || '')
    const name = String(body?.name || '')
    const email = String(body?.email || '')
    const message = String(body?.message || '')

    if (!topic || name.length < 2 || !email.includes('@')) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Intentionally minimal: a lab page should not ship a heavy contact stack by default.
    // This endpoint exists so the UI can be real. Wire to email/CRM when needed.
    console.log('[contact]', { topic, name, email, message })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}

