# Environment Variables Setup

Copy these into your Vercel project settings → Environment Variables

## Option 1: Google Sheets API (Recommended)

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id-here
```

**Note**: For `GOOGLE_PRIVATE_KEY`, include the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` with `\n` for newlines.

## Option 2: Google Apps Script Webhook (Simpler)

```
GOOGLE_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

---

## How to Get These Values

### Google Sheets API Method:
1. Create service account in Google Cloud Console
2. Download JSON key file
3. Extract `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
4. Extract `private_key` → `GOOGLE_PRIVATE_KEY`
5. Get Sheet ID from Google Sheets URL

### Webhook Method:
1. Deploy Google Apps Script (see `google-apps-script.js`)
2. Copy the Web App URL → `GOOGLE_WEBHOOK_URL`
