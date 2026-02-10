'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

type UploadState = 'idle' | 'uploading' | 'extracting' | 'done' | 'error'

interface VideoMetadata {
  duration: number
  fps: number
  resolution: {
    width: number
    height: number
  }
  codec: string
  bitrate: number
  format: string
  fileSize: number
}

interface UploadResult {
  videoId: string
  jobId: string
  metadata: VideoMetadata
  extraction: {
    fpsExtracted: number
    frameCount: number
    framesDir: string
    frameFiles: string[]
  }
  question: string
}

type JobStatusResp = {
  video: any
  job: any | null
  events: any[]
  chunkCounts: { chunk_type: string; count: number }[]
  metrics?: any
}

export default function AppPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [question, setQuestion] = useState('')
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const [jobStatus, setJobStatus] = useState<JobStatusResp | null>(null)
  const [processBusy, setProcessBusy] = useState(false)
  const [chatQ, setChatQ] = useState('')
  const [chatA, setChatA] = useState<string | null>(null)
  const [chatMs, setChatMs] = useState<number | null>(null)
  const [chatRetrieved, setChatRetrieved] = useState<any[] | null>(null)
  const [chatUsage, setChatUsage] = useState<any | null>(null)

  const refreshStatus = async (videoId: string) => {
    const r = await fetch(`/api/video/${videoId}/status`, { cache: 'no-store' })
    const j = await r.json()
    if (!r.ok) throw new Error(j?.error || 'Failed to load status')
    setJobStatus(j)
  }

  const runProcess = async (videoId: string) => {
    setProcessBusy(true)
    try {
      const r = await fetch(`/api/video/${videoId}/process`, { method: 'POST' })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Processing failed')
      await refreshStatus(videoId)
    } finally {
      setProcessBusy(false)
    }
  }

  const handleAsk = async () => {
    if (!uploadResult) return
    const q = chatQ.trim()
    if (!q) {
      setError('Enter a question first')
      return
    }
    setError(null)
    setChatA(null)
    setChatMs(null)
    setChatRetrieved(null)
    setChatUsage(null)

    const r = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ videoId: uploadResult.videoId, question: q }),
    })
    const j = await r.json()
    if (!r.ok) {
      setError(j?.error || 'Chat failed')
      return
    }
    setChatA(j.answer)
    setChatMs(j.durationMs)
    setChatRetrieved(j.retrieved)
    setChatUsage(j.llm || null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      setError(`File size exceeds 100MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`)
      return
    }

    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file')
      return
    }

    setVideoFile(file)
    setError(null)
    setCurrentStep(2)
  }

  const handleUpload = async () => {
    if (!videoFile || !question.trim()) {
      setError('Please provide both a video file and a question')
      return
    }

    setUploadState('uploading')
    setError(null)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('video', videoFile)
    formData.append('question', question)

    try {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploadProgress(percentComplete)
        }
      })

      const response = await new Promise<Response>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.responseText, { status: xhr.status }))
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`))
          }
        }
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.open('POST', '/api/upload')
        xhr.send(formData)
      })

      setUploadState('extracting')
      setUploadProgress(100)

      const result: UploadResult = await response.json()
      setUploadResult(result)
      setUploadState('done')
      setCurrentStep(3)
      setChatQ(result.question)
      setChatA(null)
      setChatMs(null)
      setChatRetrieved(null)
      await refreshStatus(result.videoId)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed. Please try again.')
      setUploadState('error')
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setVideoFile(null)
    setQuestion('')
    setUploadState('idle')
    setUploadResult(null)
    setError(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setSelectedFrame(null)
    setJobStatus(null)
    setProcessBusy(false)
    setChatQ('')
    setChatA(null)
    setChatMs(null)
    setChatRetrieved(null)
    setChatUsage(null)
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-brand-primary/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-white">
              WonderLens<span className="text-brand-accent">AI</span>
            </Link>
            <Link
              href="/"
              className="text-sm text-brand-muted hover:text-brand-accent transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Video Analysis Workflow</h1>
          <p className="text-brand-muted">Upload a video and ask questions to explore its content</p>
        </div>

        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      currentStep >= step
                        ? 'bg-brand-accent text-brand-dark'
                        : 'bg-slate-800 text-brand-muted border border-slate-700'
                    }`}
                  >
                    {currentStep > step ? '✓' : step}
                  </div>
                  <div className="mt-2 text-xs text-brand-muted text-center">
                    {step === 1 && 'Upload Video'}
                    {step === 2 && 'Add Question'}
                    {step === 3 && 'Process'}
                  </div>
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step ? 'bg-brand-accent' : 'bg-slate-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-sm text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Upload Video */}
        {currentStep === 1 && (
          <div className="bg-brand-primary rounded-lg border border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Step 1: Upload Video</h2>
            <p className="text-brand-muted mb-6">
              Select a video file (max 5 minutes, 100MB). Supported formats: MP4, MOV, AVI, etc.
            </p>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-12 text-center hover:border-brand-accent transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg className="w-16 h-16 text-brand-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-brand-accent font-semibold mb-2">Click to upload video</span>
                <span className="text-sm text-brand-muted">or drag and drop</span>
              </label>
              {videoFile && (
                <div className="mt-4 p-4 bg-slate-800 rounded border border-slate-700">
                  <p className="text-white font-medium">{videoFile.name}</p>
                  <p className="text-sm text-brand-muted">
                    {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Add Question */}
        {currentStep === 2 && (
          <div className="bg-brand-primary rounded-lg border border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Step 2: Add Question</h2>
            <p className="text-brand-muted mb-6">
              What would you like to explore in this video?
            </p>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What objects appear in the video? Are there any safety violations? Count the number of items..."
              className="w-full bg-brand-dark border border-slate-600 rounded-sm px-4 py-3 focus:outline-none focus:border-brand-accent text-white placeholder-slate-700 transition-colors min-h-[120px]"
            />
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 border border-slate-600 text-white hover:border-brand-accent hover:text-brand-accent transition-colors rounded-sm"
              >
                Back
              </button>
              <button
                onClick={handleUpload}
                disabled={!question.trim() || uploadState !== 'idle'}
                className="btn-glow px-6 py-3 bg-brand-accent text-brand-dark hover:bg-brand-accentHover font-bold rounded-sm transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload & Process
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Processing/Results */}
        {currentStep === 3 && (
          <div className="bg-brand-primary rounded-lg border border-slate-700 p-8">
            {uploadState === 'uploading' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Uploading Video...</h2>
                <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
                  <div
                    className="bg-brand-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-brand-muted text-center">{Math.round(uploadProgress)}%</p>
              </div>
            )}

            {uploadState === 'extracting' && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-white mb-2">Extracting Frames...</h2>
                <p className="text-brand-muted">Processing video and extracting frames</p>
              </div>
            )}

            {uploadState === 'done' && uploadResult && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Processing Complete!</h2>
                
                {/* Video Metadata Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Video Metadata</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800 rounded border border-slate-700">
                      <p className="text-sm text-brand-muted mb-1">Video ID / Job ID</p>
                      <p className="text-white font-mono text-sm break-all">{uploadResult.videoId}</p>
                      <p className="text-brand-muted font-mono text-xs break-all mt-1">{uploadResult.jobId}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-800 rounded border border-slate-700">
                        <p className="text-sm text-brand-muted mb-1">Duration</p>
                        <p className="text-white font-bold">{uploadResult.metadata.duration.toFixed(1)}s</p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded border border-slate-700">
                        <p className="text-sm text-brand-muted mb-1">FPS</p>
                        <p className="text-white font-bold">{uploadResult.metadata.fps}</p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded border border-slate-700">
                        <p className="text-sm text-brand-muted mb-1">Resolution</p>
                        <p className="text-white font-bold">{uploadResult.metadata.resolution.width} × {uploadResult.metadata.resolution.height}</p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded border border-slate-700">
                        <p className="text-sm text-brand-muted mb-1">Codec</p>
                        <p className="text-white font-bold uppercase">{uploadResult.metadata.codec}</p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded border border-slate-700">
                        <p className="text-sm text-brand-muted mb-1">Bitrate</p>
                        <p className="text-white font-bold">{(uploadResult.metadata.bitrate / 1000).toFixed(0)} kbps</p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded border border-slate-700">
                        <p className="text-sm text-brand-muted mb-1">Format</p>
                        <p className="text-white font-bold">{uploadResult.metadata.format}</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-slate-800 rounded border border-slate-700">
                      <p className="text-sm text-brand-muted mb-1">File Size</p>
                      <p className="text-white font-bold">{(uploadResult.metadata.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                </div>

                {/* Extraction Results Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Extraction Results</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800 rounded border border-slate-700">
                      <p className="text-sm text-brand-muted mb-1">Frames Extracted</p>
                      <p className="text-white font-bold text-xl">{uploadResult.extraction.frameCount}</p>
                    </div>
                    <div className="p-4 bg-slate-800 rounded border border-slate-700">
                      <p className="text-sm text-brand-muted mb-1">Extraction Rate</p>
                      <p className="text-white font-bold">{uploadResult.extraction.fpsExtracted} frame/sec</p>
                    </div>
                  </div>
                </div>

                {/* Question Section */}
                <div className="mb-6">
                  <div className="p-4 bg-slate-800 rounded border border-slate-700">
                    <p className="text-sm text-brand-muted mb-1">Your Question</p>
                    <p className="text-white">{uploadResult.question}</p>
                  </div>
                </div>

                {/* Background Processing (LLM + Vector) */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Background (LLM + Vector DB)</h3>
                  <div className="p-4 bg-slate-800 rounded border border-slate-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-sm">
                        <p className="text-white font-mono">
                          Video: <span className="text-brand-muted">{jobStatus?.video?.status || 'n/a'}</span>
                        </p>
                        <p className="text-white font-mono">
                          Job: <span className="text-brand-muted">{jobStatus?.job?.status || 'n/a'}</span>{' '}
                          <span className="text-brand-muted">/</span>{' '}
                          <span className="text-brand-muted">{jobStatus?.job?.step || 'n/a'}</span>
                        </p>
                        <p className="text-brand-muted text-xs mt-1">
                          This builds a visual index from frames (scene captions + embeddings).
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => runProcess(uploadResult.videoId)}
                          disabled={processBusy}
                          className="btn-glow px-4 py-2 bg-brand-accent text-brand-dark hover:bg-brand-accentHover font-bold rounded-sm transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processBusy ? 'Running…' : 'Run Scene Processing'}
                        </button>
                        <button
                          onClick={() => refreshStatus(uploadResult.videoId)}
                          className="px-4 py-2 border border-slate-600 text-white hover:border-brand-accent hover:text-brand-accent transition-colors rounded-sm"
                        >
                          Refresh
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-brand-dark rounded border border-slate-700">
                        <p className="text-brand-muted text-xs mb-1">Chunks Stored</p>
                        <p className="text-white font-mono">
                          {(jobStatus?.chunkCounts || []).reduce((acc, x) => acc + Number(x.count), 0)}
                        </p>
                      </div>
                      <div className="p-3 bg-brand-dark rounded border border-slate-700">
                        <p className="text-brand-muted text-xs mb-1">Frames Stored</p>
                        <p className="text-white font-mono">{jobStatus?.video?.frame_count ?? uploadResult.extraction.frameCount}</p>
                      </div>
                    </div>

                    {/* Control Center */}
                    {jobStatus?.metrics && (
                      <div className="mt-4 p-3 bg-brand-dark rounded border border-slate-700">
                        <p className="text-white font-semibold mb-3">Control Center</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="p-3 bg-slate-900/40 rounded border border-slate-700">
                            <p className="text-brand-muted text-xs mb-1">OpenAI Calls</p>
                            <p className="text-white font-mono">{jobStatus.metrics.openaiTotals?.calls ?? 0}</p>
                          </div>
                          <div className="p-3 bg-slate-900/40 rounded border border-slate-700">
                            <p className="text-brand-muted text-xs mb-1">OpenAI Tokens</p>
                            <p className="text-white font-mono">{jobStatus.metrics.openaiTotals?.total ?? 0}</p>
                          </div>
                          <div className="p-3 bg-slate-900/40 rounded border border-slate-700">
                            <p className="text-brand-muted text-xs mb-1">Prompt Tokens</p>
                            <p className="text-white font-mono">{jobStatus.metrics.openaiTotals?.prompt ?? 0}</p>
                          </div>
                          <div className="p-3 bg-slate-900/40 rounded border border-slate-700">
                            <p className="text-brand-muted text-xs mb-1">Completion Tokens</p>
                            <p className="text-white font-mono">{jobStatus.metrics.openaiTotals?.completion ?? 0}</p>
                          </div>
                          <div className="p-3 bg-slate-900/40 rounded border border-slate-700">
                            <p className="text-brand-muted text-xs mb-1">Frames Bytes (local)</p>
                            <p className="text-white font-mono">
                              {jobStatus.metrics.framesBytes != null ? jobStatus.metrics.framesBytes.toLocaleString() : 'n/a'}
                            </p>
                          </div>
                          <div className="p-3 bg-slate-900/40 rounded border border-slate-700">
                            <p className="text-brand-muted text-xs mb-1">Avg Frame (bytes)</p>
                            <p className="text-white font-mono">
                              {jobStatus.metrics.framesBytes != null && (jobStatus.video.frame_count ?? 0)
                                ? Math.round(jobStatus.metrics.framesBytes / jobStatus.video.frame_count).toLocaleString()
                                : 'n/a'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-brand-muted text-xs mb-2">Latency By Step (ms)</p>
                          <div className="space-y-2">
                            {Object.entries(jobStatus.metrics.byStep || {}).slice(0, 12).map(([step, v]: any) => (
                              <div key={step} className="flex items-center justify-between text-xs font-mono">
                                <span className="text-white/90">{step}</span>
                                <span className="text-brand-muted">
                                  {Number(v.durationMs || 0).toLocaleString()} ms ({v.count || 0} events)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <p className="text-brand-muted text-xs mb-2">Recent Events</p>
                      <div className="max-h-56 overflow-auto space-y-2">
                        {(jobStatus?.events || []).length === 0 && (
                          <p className="text-brand-muted text-sm">No events yet.</p>
                        )}
                        {(jobStatus?.events || []).map((e: any, idx: number) => (
                          <div key={idx} className="flex items-start justify-between gap-3 text-xs font-mono">
                            <div className="min-w-0">
                              <span className="text-brand-muted">{new Date(e.ts).toLocaleTimeString()} </span>
                              <span className="text-white/90">{e.step || 'step'}:</span>{' '}
                              <span className="text-brand-text">{e.message}</span>
                            </div>
                            <div className="shrink-0 text-brand-muted">
                              {e.duration_ms != null ? `${e.duration_ms} ms` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Ask Questions (RAG)</h3>
                  <div className="p-4 bg-slate-800 rounded border border-slate-700">
                    <textarea
                      value={chatQ}
                      onChange={(e) => setChatQ(e.target.value)}
                      placeholder="Ask a question about this video..."
                      className="w-full bg-brand-dark border border-slate-600 rounded-sm px-4 py-3 focus:outline-none focus:border-brand-accent text-white placeholder-slate-700 transition-colors min-h-[100px]"
                    />
                    <div className="mt-3 flex gap-3">
                      <button
                        onClick={handleAsk}
                        className="btn-glow px-4 py-2 bg-brand-accent text-brand-dark hover:bg-brand-accentHover font-bold rounded-sm transition-all uppercase tracking-wider"
                      >
                        Ask
                      </button>
                      {chatMs != null && (
                        <span className="text-xs font-mono text-brand-muted self-center">{chatMs} ms</span>
                      )}
                      {chatUsage?.usage?.total_tokens != null && (
                        <span className="text-xs font-mono text-brand-muted self-center">
                          {chatUsage.model} · {chatUsage.usage.total_tokens} tokens
                        </span>
                      )}
                    </div>

                    {chatA && (
                      <div className="mt-4 p-3 bg-brand-dark rounded border border-slate-700">
                        <p className="text-white font-semibold mb-2">Answer</p>
                        <p className="text-brand-text whitespace-pre-wrap text-sm leading-relaxed">{chatA}</p>
                      </div>
                    )}

                    {chatRetrieved && (
                      <div className="mt-4">
                        <p className="text-brand-muted text-xs mb-2">Retrieved Chunks</p>
                        <div className="space-y-2 max-h-64 overflow-auto">
                          {chatRetrieved.map((r: any, idx: number) => (
                            <div key={idx} className="p-3 bg-brand-dark rounded border border-slate-700">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-mono text-white/90">
                                  {r.chunk_type} {r.start_ts_sec ?? '?'}s-{r.end_ts_sec ?? '?'}s
                                </p>
                                <p className="text-xs font-mono text-brand-muted">
                                  dist {typeof r.distance === 'number' ? r.distance.toFixed(3) : r.distance}
                                </p>
                              </div>
                              <p className="text-sm text-brand-text whitespace-pre-wrap">{r.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Extracted Frames Gallery */}
                {uploadResult.extraction.frameFiles && uploadResult.extraction.frameFiles.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Extracted Frames ({uploadResult.extraction.frameFiles.length})</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {uploadResult.extraction.frameFiles.map((frameFile, index) => {
                        const frameUrl = `/api/frames/${uploadResult.videoId}/${frameFile}`
                        return (
                          <div
                            key={frameFile}
                            className="relative group cursor-pointer overflow-hidden rounded border border-slate-700 hover:border-brand-accent transition-all"
                            onClick={() => setSelectedFrame(frameUrl)}
                          >
                            <img
                              src={frameUrl}
                              alt={`Frame ${index + 1}`}
                              className="w-full h-auto object-cover aspect-video"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-mono bg-black/50 px-2 py-1 rounded">
                                {frameFile.replace('.jpg', '')}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Frame Modal */}
                {selectedFrame && (
                  <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedFrame(null)}
                  >
                    <div className="relative max-w-7xl max-h-full">
                      <button
                        onClick={() => setSelectedFrame(null)}
                        className="absolute -top-10 right-0 text-white hover:text-brand-accent transition-colors"
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <img
                        src={selectedFrame}
                        alt="Selected frame"
                        className="max-w-full max-h-[90vh] object-contain rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}

                <div className="p-4 bg-brand-success/10 border border-brand-success/30 rounded-sm mb-6">
                  <p className="text-brand-success text-sm font-mono">
                    ✓ Video metadata extracted and frames extracted successfully. Ready for analysis.
                  </p>
                  <p className="text-brand-muted text-xs mt-2">
                    Next: Run processing to transcribe audio and build the searchable vector index.
                  </p>
                </div>
                
                <button
                  onClick={handleReset}
                  className="btn-glow px-6 py-3 bg-brand-accent text-brand-dark hover:bg-brand-accentHover font-bold rounded-sm transition-all uppercase tracking-wider"
                >
                  Process Another Video
                </button>
              </div>
            )}

            {uploadState === 'error' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Processing Failed</h2>
                <p className="text-red-400 mb-6">{error}</p>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-brand-accent text-brand-dark hover:bg-brand-accentHover font-bold rounded-sm transition-all uppercase tracking-wider"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
