-- WonderLens AI: Postgres + pgvector schema (Level 1)
-- Apply manually in your Postgres (Neon/Supabase/etc).

create extension if not exists vector;

create table if not exists videos (
  id uuid primary key,
  created_at timestamptz not null default now(),

  filename text,
  mime_type text,
  size_bytes bigint,

  duration_sec double precision,
  width int,
  height int,
  fps double precision,
  codec text,
  bitrate int,
  format text,

  frames_fps double precision,
  frame_count int,

  -- Local/dev path or blob URL (prod).
  video_path text,
  frames_path text,

  status text not null default 'uploaded',
  error text
);

create table if not exists jobs (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  video_id uuid not null references videos(id) on delete cascade,

  kind text not null default 'ingest',
  status text not null default 'queued', -- queued|running|done|error
  step text not null default 'transcribe', -- transcribe|caption_frames|done
  state jsonb not null default '{}'::jsonb,

  started_at timestamptz,
  finished_at timestamptz,
  error text
);

create index if not exists jobs_video_id_idx on jobs(video_id);

create table if not exists job_events (
  id bigserial primary key,
  ts timestamptz not null default now(),
  job_id uuid not null references jobs(id) on delete cascade,
  level text not null default 'info', -- info|warn|error
  step text,
  message text not null,
  duration_ms int,
  data jsonb not null default '{}'::jsonb
);

create index if not exists job_events_job_id_ts_idx on job_events(job_id, ts desc);

create table if not exists video_chunks (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  video_id uuid not null references videos(id) on delete cascade,

  chunk_type text not null, -- transcript|frame_caption|summary|ocr
  start_ts_sec double precision,
  end_ts_sec double precision,
  content text not null,

  -- text-embedding-3-small is 1536 dims.
  embedding vector(1536)
);

create index if not exists video_chunks_video_id_idx on video_chunks(video_id);
create index if not exists video_chunks_embedding_idx on video_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create table if not exists chat_threads (
  id uuid primary key,
  created_at timestamptz not null default now(),
  video_id uuid not null references videos(id) on delete cascade
);

create table if not exists chat_messages (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  role text not null, -- user|assistant|system
  content text not null,
  duration_ms int,
  retrieved jsonb not null default '[]'::jsonb
);

create index if not exists chat_messages_thread_id_idx on chat_messages(thread_id, created_at);

