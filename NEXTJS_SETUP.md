# Next.js Setup Guide

This guide will help you set up the Next.js 14 product flow on top of your existing marketing website.

## Prerequisites

- Node.js 18+ installed
- ffmpeg and ffprobe installed (see below)
- Google OAuth credentials

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create a `.env.local` file in the root directory:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: For production
NODE_ENV=production
```

### Generating NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (for local dev)
7. For production, add: `https://yourdomain.com/api/auth/callback/google`
8. Copy the Client ID and Client Secret to your `.env.local`

## Installing ffmpeg

### macOS
```bash
brew install ffmpeg
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

### Windows
1. Download from https://ffmpeg.org/download.html
2. Extract and add to PATH
3. Or use chocolatey: `choco install ffmpeg`

### Verify Installation
```bash
ffmpeg -version
ffprobe -version
```

## Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth configuration
│   │   └── upload/route.ts               # Video upload & frame extraction
│   ├── app/
│   │   ├── layout.tsx                    # Session provider wrapper
│   │   └── page.tsx                      # Main app page (protected)
│   ├── login/
│   │   └── page.tsx                      # Login page
│   ├── globals.css                       # Global styles
│   ├── layout.tsx                        # Root layout
│   └── page.tsx                          # Marketing home page
├── lib/
│   └── auth.ts                           # Auth utilities
├── data/
│   └── frames/                           # Extracted frames storage (gitignored)
└── .env.local                            # Environment variables (gitignored)
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Important for Vercel:**
- Vercel has a 50MB limit for serverless functions by default
- For larger uploads, consider using Vercel Blob Storage or external storage
- ffmpeg needs to be available in the deployment environment
- Consider using a Docker container or external service for ffmpeg processing

### Environment Variables for Production

Update `NEXTAUTH_URL` to your production domain:
```env
NEXTAUTH_URL=https://yourdomain.com
```

## Features

### Authentication
- Google OAuth via NextAuth.js
- Protected routes (`/app`)
- Automatic redirect to login if not authenticated

### Video Upload
- Max duration: 2 minutes (120 seconds)
- Max file size: 100MB
- Supported formats: MP4, MOV, AVI, etc.
- Client-side and server-side validation

### Frame Extraction
- Extracts 1 frame per second (configurable)
- Uses ffmpeg for extraction
- Stores frames as JPEGs in `./data/frames/<upload_id>/`
- Returns metadata: upload_id, duration, frame_count, etc.

### Future Extensibility
The code includes TODO markers for:
- Database storage (metadata, embeddings)
- GPT analysis on selected frames
- Embedding generation for similarity search
- Temporal context building

## Troubleshooting

### ffmpeg not found
- Ensure ffmpeg is installed and in your PATH
- Check with `which ffmpeg` (macOS/Linux) or `where ffmpeg` (Windows)

### Upload fails
- Check file size limits
- Verify video duration is under 2 minutes
- Check server logs for detailed errors

### Authentication issues
- Verify Google OAuth credentials are correct
- Check redirect URIs match your domain
- Ensure NEXTAUTH_SECRET is set

### Frames not extracting
- Verify ffmpeg is installed correctly
- Check write permissions for `./data/frames/` directory
- Review server logs for ffmpeg errors

## Next Steps

1. Set up a database (PostgreSQL, MongoDB, etc.) for storing metadata
2. Implement embedding generation using vision models
3. Add GPT-4V integration for frame analysis
4. Build temporal context analysis
5. Add frame preview UI
6. Implement frame selection based on question relevance
