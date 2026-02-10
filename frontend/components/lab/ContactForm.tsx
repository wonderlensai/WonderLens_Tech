'use client'

import { useMemo, useState } from 'react'

type Topic = 'Partner' | 'Research' | 'Investment'

export function ContactForm() {
  const [topic, setTopic] = useState<Topic>('Partner')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const canSend = useMemo(() => {
    const e = email.trim()
    return name.trim().length > 1 && e.includes('@') && e.includes('.')
  }, [name, email])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSend || status === 'sending') return
    setStatus('sending')
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ topic, name: name.trim(), email: email.trim(), message: message.trim() }),
      })
      if (!r.ok) throw new Error('bad_status')
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-[10px] font-mono tracking-[0.28em] uppercase text-brand-amber">
          Intent
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['Partner', 'Research', 'Investment'] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTopic(t)}
              className={[
                'rounded border px-3 py-2 text-[11px] font-mono tracking-[0.18em] uppercase transition-colors',
                topic === t
                  ? 'border-brand-iris bg-brand-iris/15 text-brand-iris'
                  : 'border-brand-faint text-brand-muted hover:text-brand-iris hover:border-brand-iris/50',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="name" className="text-[10px] font-mono tracking-[0.28em] uppercase text-brand-amber">
          Name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 rounded border border-brand-iris/25 bg-brand-dark/80 px-4 text-sm font-mono text-brand-text placeholder:text-brand-faint focus:outline-none focus:border-brand-iris focus:ring-1 focus:ring-brand-iris/30 transition-colors"
          placeholder="Dr. Ada Lovelace"
          autoComplete="name"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="email" className="text-[10px] font-mono tracking-[0.28em] uppercase text-brand-amber">
          Email
        </label>
        <input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded border border-brand-iris/25 bg-brand-dark/80 px-4 text-sm font-mono text-brand-text placeholder:text-brand-faint focus:outline-none focus:border-brand-iris focus:ring-1 focus:ring-brand-iris/30 transition-colors"
          placeholder="ada@example.com"
          autoComplete="email"
          inputMode="email"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="message" className="text-[10px] font-mono tracking-[0.28em] uppercase text-brand-amber">
          Note (optional)
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[110px] rounded border border-brand-iris/25 bg-brand-dark/80 px-4 py-3 text-sm font-mono text-brand-text placeholder:text-brand-faint focus:outline-none focus:border-brand-iris focus:ring-1 focus:ring-brand-iris/30 transition-colors"
          placeholder="Describe your problem space..."
        />
      </div>

      <div className="flex items-center justify-between gap-4 pt-2">
        <p className="text-[10px] font-mono text-brand-faint tracking-wide">
          Minimal by design.
        </p>
        <button
          type="submit"
          disabled={!canSend || status === 'sending' || status === 'sent'}
          className="rounded border border-brand-iris bg-brand-iris/10 px-5 py-2 text-[11px] font-mono tracking-[0.22em] uppercase text-brand-iris hover:bg-brand-iris/20 hover:text-brand-irisLight transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === 'idle' && 'Send'}
          {status === 'sending' && 'Sending...'}
          {status === 'sent' && 'Received'}
          {status === 'error' && 'Retry'}
        </button>
      </div>

      {status === 'sent' && (
        <p className="text-xs font-mono text-brand-success">
          Message received. We&apos;ll respond within 48h.
        </p>
      )}

      {status === 'error' && (
        <p className="text-xs font-mono text-brand-danger">
          Send failed. Email directly: <span className="text-brand-iris">lab@wonderlens.ai</span>
        </p>
      )}
    </form>
  )
}
