# WonderLens AI - Vercel Deployment Guide

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier is sufficient)
2. **Google Account**: For Google Sheets integration
3. **GitHub Account** (optional but recommended): For easy deployment

---

## 🚀 Step-by-Step Deployment

### Step 1: Set Up Google Sheets

#### Option A: Using Google Sheets API (Recommended for production)

1. **Create a Google Sheet**:
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet
   - Name it "WonderLens Demo Requests"
   - Add headers in Row 1: `Timestamp | Name | Company | Email | Phone | Industry | Use Case`

2. **Create a Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project (or use existing)
   - Enable "Google Sheets API"
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name it "wonderlens-api" and click "Create"
   - Skip role assignment, click "Done"
   - Click on the service account → "Keys" tab → "Add Key" → "Create new key"
   - Choose JSON format and download the key file

3. **Share Sheet with Service Account**:
   - Open your Google Sheet
   - Click "Share" button
   - Add the service account email (found in the JSON file as `client_email`)
   - Give it "Editor" permissions

4. **Get Sheet ID**:
   - From your Google Sheet URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
   - Copy the `SHEET_ID` part

#### Option B: Using Google Apps Script (Simpler, no API keys needed)

1. **Create a Google Sheet** (same as above)

2. **Create Apps Script Webhook**:
   - In your Google Sheet, go to "Extensions" → "Apps Script"
   - Replace the code with the script from `google-apps-script.js` (see below)
   - Click "Deploy" → "New deployment"
   - Choose "Web app" as type
   - Set execute as "Me" and access to "Anyone"
   - Copy the Web App URL

3. **Update API Route**:
   - Use the simpler webhook version in `api/submit-webhook.js`

---

### Step 2: Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

---

### Step 3: Deploy to Vercel

#### Method 1: Via Vercel Dashboard (Easiest)

1. **Push to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect settings

3. **Add Environment Variables**:
   - In your Vercel project settings, go to "Environment Variables"
   - Add these variables:

   **For Google Sheets API (Option A)**:
   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=<from-json-file>
   GOOGLE_PRIVATE_KEY=<from-json-file>
   GOOGLE_SHEET_ID=<your-sheet-id>
   ```

   **For Webhook (Option B)**:
   ```
   GOOGLE_WEBHOOK_URL=<your-apps-script-url>
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your site is live! 🎉

#### Method 2: Via CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL
vercel env add GOOGLE_PRIVATE_KEY
vercel env add GOOGLE_SHEET_ID

# Deploy to production
vercel --prod
```

---

### Step 4: Test the Form

1. Visit your deployed site
2. Fill out the demo request form
3. Submit and check your Google Sheet
4. You should see a new row with the submission!

---

## 🔧 Troubleshooting

### Form not submitting?
- Check browser console for errors
- Verify API route is accessible: `https://your-domain.vercel.app/api/submit`
- Check Vercel function logs in dashboard

### Google Sheets not updating?
- Verify service account has access to the sheet
- Check that `GOOGLE_SHEET_ID` is correct
- Verify the sheet range matches (default: `Sheet1!A:G`)

### Environment variables not working?
- Make sure variables are set in Vercel dashboard
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

---

## 📁 Project Structure

```
WonderLens_Tech/
├── index.html          # Main website
├── api/
│   └── submit.js      # Form submission handler
├── package.json       # Dependencies
├── vercel.json        # Vercel configuration
└── README.md          # This file
```

---

## 🔐 Security Notes

- Never commit `.json` service account keys to Git
- Use Vercel environment variables for all secrets
- The API route validates input and only accepts POST requests
- Consider adding rate limiting for production

---

## 🎯 Next Steps

- Set up custom domain in Vercel
- Add email notifications (optional)
- Add analytics tracking
- Set up monitoring/error tracking

---

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify Google Sheets API is enabled
3. Test API endpoint directly with curl/Postman

---

**That's it! Your WonderLens AI website is now live and collecting demo requests! 🚀**
