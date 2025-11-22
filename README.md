# WonderLens AI - Industrial Computer Vision Platform

A futuristic landing page for WonderLens AI, an AI + Computer Vision platform that turns any camera into an industrial automation system.

## 🚀 Quick Start

### Local Development
Simply open `index.html` in any modern web browser.

### Deploy to Vercel
See **[QUICKSTART.md](./QUICKSTART.md)** for the fastest deployment path, or **[DEPLOYMENT.md](./DEPLOYMENT.md)** for detailed instructions.

## 📁 Project Structure

```
├── index.html              # Main website
├── api/
│   ├── submit.js          # Form handler (Google Sheets API)
│   └── submit-webhook.js  # Alternative handler (Webhook)
├── package.json           # Dependencies
├── vercel.json            # Vercel configuration
├── DEPLOYMENT.md          # Detailed deployment guide
├── QUICKSTART.md          # Quick deployment guide
└── ENV_SETUP.md           # Environment variables setup
```

## 🛠️ Technology Stack

- **HTML5**: Semantic structure
- **Tailwind CSS**: Utility-first CSS framework (via CDN)
- **Inter + JetBrains Mono**: Modern typography
- **Vercel Serverless Functions**: Form submission handling
- **Google Sheets API**: Data storage

## ✨ Features

- ✅ Fully responsive design
- ✅ Futuristic UI with microinteractions
- ✅ Form submission to Google Sheets
- ✅ No backend server required
- ✅ Deploy-ready for Vercel

## 📝 Form Submission

The contact form automatically saves submissions to Google Sheets. Two integration methods available:

1. **Google Sheets API** (Recommended for production)
2. **Google Apps Script Webhook** (Easier setup)

See `DEPLOYMENT.md` for setup instructions.

## 🎨 Customization

- Edit `index.html` for content changes
- Modify Tailwind config in `<head>` for theme colors
- Update `api/submit.js` for form handling logic

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get deployed in 5 minutes
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[ENV_SETUP.md](./ENV_SETUP.md)** - Environment variables reference

## 🔒 Security

- Never commit service account keys
- Use Vercel environment variables for secrets
- Form validation on both client and server side

---

**Built with ❤️ for WonderLens AI**


