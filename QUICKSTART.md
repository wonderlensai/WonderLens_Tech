# Quick Start Guide

## 🚀 Fastest Deployment Path

### 1. Set Up Google Sheets (Choose One Method)

**Method A: Google Apps Script (Easiest - 5 minutes)**
1. Create a Google Sheet with headers: `Timestamp | Name | Company | Email | Phone | Industry | Use Case`
2. Open `google-apps-script.js` and copy the code
3. In Google Sheets: Extensions → Apps Script → Paste code → Deploy → Web app
4. Copy the webhook URL
5. Rename `api/submit-webhook.js` to `api/submit.js` (replace the existing one)

**Method B: Google Sheets API (More secure, 10 minutes)**
1. Follow the detailed guide in `DEPLOYMENT.md`
2. Set up service account and get credentials
3. Use the existing `api/submit.js`

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

Or use the Vercel Dashboard:
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables (see `ENV_SETUP.md`)
4. Deploy!

### 3. Test

Visit your site and submit the form. Check your Google Sheet!

---

## 📝 Files Overview

- `index.html` - Main website
- `api/submit.js` - Form handler (Google Sheets API)
- `api/submit-webhook.js` - Alternative handler (Webhook)
- `package.json` - Dependencies
- `vercel.json` - Vercel config
- `DEPLOYMENT.md` - Detailed deployment guide
- `ENV_SETUP.md` - Environment variables guide

---

## ❓ FAQ

**Do I need a backend server?**  
No! Vercel serverless functions handle everything.

**Which method should I use?**  
- Webhook (Method A): Easier setup, good for testing
- API (Method B): More secure, better for production

**Is it free?**  
Yes! Vercel free tier includes 100GB bandwidth/month, which is plenty for a landing page.
