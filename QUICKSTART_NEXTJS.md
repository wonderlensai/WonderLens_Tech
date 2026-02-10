# Quick Start Guide - Next.js Product Flow

This guide will get you up and running with the new Next.js product flow in 5 minutes.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Install ffmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

**Verify:**
```bash
ffmpeg -version
ffprobe -version
```

## Step 3: Set Up Environment Variables

Create `.env.local` in the root directory:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Quick way to generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

## Step 4: Get Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create/select a project
3. Enable Google+ API
4. Create OAuth 2.0 Client ID
5. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

## Step 5: Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Testing the Flow

1. **Home Page** (`/`): Click "Try It" button
2. **Login** (`/login`): Sign in with Google
3. **App** (`/app`): 
   - Upload a video (max 2 min, 100MB)
   - Add a question
   - Click "Upload & Process"
   - Wait for frame extraction to complete

## What Happens Behind the Scenes

1. Video is uploaded to server
2. Server validates duration (must be ≤ 2 minutes)
3. Server extracts 1 frame per second using ffmpeg
4. Frames are saved to `./data/frames/<upload_id>/`
5. Response includes metadata: upload_id, frame_count, duration, etc.

## Troubleshooting

**"ffmpeg not found"**
- Install ffmpeg (see Step 2)
- Verify with `which ffmpeg`

**"Unauthorized" error**
- Check Google OAuth credentials
- Verify redirect URI matches exactly

**Upload fails**
- Check file size (max 100MB)
- Check video duration (max 2 minutes)
- Check server logs: `npm run dev` shows errors

**Frames not extracting**
- Verify ffmpeg is installed
- Check `./data/frames/` directory permissions
- Review server console for ffmpeg errors

## Next Steps

- Set up database for metadata storage
- Implement GPT-4V analysis
- Add embedding generation
- Build temporal context analysis

See `NEXTJS_SETUP.md` for detailed documentation.
