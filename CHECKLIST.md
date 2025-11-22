# ✅ Deployment Checklist

Use this checklist to ensure everything is set up correctly before deploying.

## Pre-Deployment

- [ ] Google Sheet created with headers: `Timestamp | Name | Company | Email | Phone | Industry | Use Case`
- [ ] Chosen integration method (API or Webhook)
- [ ] Service account created (if using API method)
- [ ] Service account JSON key downloaded (if using API method)
- [ ] Sheet shared with service account email (if using API method)
- [ ] Google Apps Script deployed (if using Webhook method)
- [ ] Webhook URL copied (if using Webhook method)

## Vercel Setup

- [ ] Vercel account created
- [ ] Project pushed to GitHub (recommended) or ready for CLI deployment
- [ ] Environment variables added in Vercel dashboard:
  - [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL` (API method)
  - [ ] `GOOGLE_PRIVATE_KEY` (API method)
  - [ ] `GOOGLE_SHEET_ID` (API method)
  - [ ] OR `GOOGLE_WEBHOOK_URL` (Webhook method)

## Code Verification

- [ ] `package.json` includes `googleapis` dependency
- [ ] `vercel.json` configured correctly
- [ ] `api/submit.js` uses correct method (API or Webhook)
- [ ] Form in `index.html` has proper `name` attributes
- [ ] Form submission JavaScript is working

## Testing

- [ ] Site deployed successfully on Vercel
- [ ] Form loads correctly
- [ ] Form validation works (try submitting empty form)
- [ ] Form submission works (check browser console)
- [ ] Data appears in Google Sheet
- [ ] Success/error messages display correctly

## Post-Deployment

- [ ] Custom domain configured (optional)
- [ ] Analytics added (optional)
- [ ] Error monitoring set up (optional)
- [ ] Test submission received and verified

---

## 🐛 Common Issues

**Form not submitting?**
- Check browser console for errors
- Verify API route: `https://your-domain.vercel.app/api/submit`
- Check Vercel function logs

**Data not appearing in sheet?**
- Verify service account has access (API method)
- Check webhook URL is correct (Webhook method)
- Verify environment variables are set correctly
- Check Vercel function logs for errors

**Build failing?**
- Ensure `package.json` has correct dependencies
- Check that `api/submit.js` uses ES modules (`import` not `require`)
- Verify Node.js version compatibility

---

**Ready to deploy?** Follow the guide in `DEPLOYMENT.md` or `QUICKSTART.md`!
