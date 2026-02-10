# Frontend - Next.js Application

This is the Next.js 14 frontend application for WonderLens AI.

## Structure

```
frontend/
├── app/              # Next.js App Router
│   ├── api/         # API routes
│   ├── app/         # Main app pages
│   ├── login/       # Login page
│   └── page.tsx     # Home page
├── lib/             # Utility functions
├── middleware.ts    # Route middleware
└── package.json     # Dependencies
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```

## API Routes

API routes are located in `app/api/`:
- `/api/upload` - Video upload and frame extraction
- `/api/frames/[uploadId]/[frameName]` - Serve extracted frames
- `/api/auth/[...nextauth]` - Authentication (if enabled)
