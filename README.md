# WonderLens AI

Industrial Computer Vision Platform

## Project Structure

```
├── frontend/          # Next.js application (UI + API routes)
├── backend/          # Backend services (future: separate API server, workers, etc.)
├── data/             # Data storage (frames, etc.)
└── package.json      # Root workspace configuration
```

## Quick Start

### Install Dependencies

```bash
npm run install:all
```

Or install individually:
```bash
cd frontend && npm install
cd ../backend && npm install
```

### Run Development Server

```bash
npm run dev
```

This will start the Next.js frontend development server.

### Build for Production

```bash
npm run build
npm start
```

## Frontend

The frontend is a Next.js 14 application with:
- React components and pages
- API routes (in `app/api/`)
- Video upload and processing
- Frame extraction and display

See `frontend/README.md` for more details.

## Backend

The backend folder is reserved for future services:
- Separate API server (if needed)
- Background workers
- Microservices
- etc.

Currently, API routes are handled by Next.js in the frontend.

## Environment Variables

See `ENV_SETUP.md` for environment variable configuration.

## Documentation

- `QUICKSTART_NEXTJS.md` - Quick start guide
- `NEXTJS_SETUP.md` - Detailed setup instructions
- `ENV_SETUP.md` - Environment variables guide
- `IMPLEMENTATION_SUMMARY.md` - Complete implementation overview
