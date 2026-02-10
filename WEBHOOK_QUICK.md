# ⚡ Webhook Setup - Quick Reference

## 🎯 5-Minute Setup

### 1. Create Sheet
- Google Sheets → New → Add headers: `Timestamp | Name | Company | Email | Phone | Industry | Use Case`

### 2. Create Script
- Extensions → Apps Script → Paste code from `google-apps-script.js` → Save

### 3. Deploy
- Deploy → New deployment → Web app → Execute as: `Me` → Access: `Anyone` → Deploy → Copy URL

### 4. Update Code
- Rename `api/submit-webhook.js` → `api/submit.js` (or copy webhook code)

### 5. Add to Vercel
- Vercel Dashboard → Settings → Environment Variables
- Add: `GOOGLE_WEBHOOK_URL` = (your webhook URL)
- Redeploy

### 6. Test
- Submit form → Check Google Sheet → ✅ Done!

---

## 📋 Required Files

- ✅ `google-apps-script.js` - Script to paste in Apps Script
- ✅ `api/submit-webhook.js` - API handler (rename to `submit.js`)
- ✅ `GOOGLE_WEBHOOK_URL` - Environment variable in Vercel

---

## 🔗 Key URLs

- **Google Sheets:** https://sheets.google.com
- **Apps Script:** Extensions → Apps Script (in your sheet)
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## ⚠️ Common Mistakes

1. ❌ Not setting access to "Anyone" → Fix: Redeploy with correct settings
2. ❌ Forgetting to redeploy Vercel → Fix: Redeploy after adding env variable
3. ❌ Wrong column headers → Fix: Match exactly: Timestamp | Name | Company | Email | Phone | Industry | Use Case
4. ❌ Testing on wrong sheet → Fix: Use the same sheet where script is deployed

---

**Full guide:** See `WEBHOOK_SETUP_GUIDE.md`

