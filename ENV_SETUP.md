# Environment Variables Setup

Copy these into your Vercel project settings → Environment Variables

## Next.js App Authentication (Required)

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## Level 1 Video RAG Pipeline (Required For Upload + Processing)

```
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME
OPENAI_API_KEY=your-openai-api-key
```

Optional model overrides:

```
OPENAI_TRANSCRIBE_MODEL=whisper-1
OPENAI_EMBED_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_VISION_MODEL=gpt-4.1-nano
OPENAI_MAX_CAPTION_FRAMES=24
```

Database setup:
- Apply `db/schema.sql` to your Postgres and ensure the `vector` extension is enabled.

**For Production:**
- Set `NEXTAUTH_URL` to your production domain (e.g., `https://yourdomain.com`)
- Generate `NEXTAUTH_SECRET` using: `openssl rand -base64 32`

**Getting Google OAuth Credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen
6. Add authorized redirect URI:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy the Client ID and Client Secret

---

## Legacy: Google Sheets API (Optional - for existing form submissions)

### Option 1: Google Sheets API (Recommended)

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id-here
```

**Note**: For `GOOGLE_PRIVATE_KEY`, include the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` with `\n` for newlines.

### Option 2: Google Apps Script Webhook (Simpler)

```
GOOGLE_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

---

## How to Get These Values

### Google OAuth (For Next.js App):
1. Follow steps above in "Getting Google OAuth Credentials"

### Google Sheets API Method:
1. Create service account in Google Cloud Console
2. Download JSON key file
3. Extract `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
4. Extract `private_key` → `GOOGLE_PRIVATE_KEY`
5. Get Sheet ID from Google Sheets URL

### Webhook Method:
1. Deploy Google Apps Script (see `google-apps-script.js`)
2. Copy the Web App URL → `GOOGLE_WEBHOOK_URL`
