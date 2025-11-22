# 🚀 Push to GitHub via PyCharm - Step by Step Guide

## Prerequisites
- PyCharm installed (any version with Git support)
- GitHub account created
- Internet connection

---

## Step 1: Initialize Git Repository (if not done)

### Option A: Via PyCharm
1. Open PyCharm
2. Open your project: `File` → `Open` → Select `WonderLens_Tech` folder
3. Go to `VCS` → `Enable Version Control Integration`
4. Select `Git` from dropdown
5. Click `OK`

### Option B: Via Terminal (Alternative)
```bash
cd /Users/jeemitpatel/Downloads/WonderLens_Tech
git init
```

---

## Step 2: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **`+`** icon (top right) → **`New repository`**
3. Repository name: `WonderLens_Tech` (or any name you prefer)
4. Description: `WonderLens AI - Industrial Computer Vision Platform`
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **`Create repository`**
8. **Copy the repository URL** (you'll need it in Step 4)

---

## Step 3: Stage All Files in PyCharm

1. In PyCharm, look at the bottom toolbar for **`Version Control`** tab
2. Click on it to open the Git panel
3. You'll see all your files listed
4. Click the **`+`** button (or right-click → `Git` → `Add`) to stage all files
   - Or use `Ctrl+Alt+A` (Windows/Linux) or `Cmd+Alt+A` (Mac)
5. All files should now show as green (staged)

**Alternative:** Use the commit dialog:
- Press `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)
- In the commit dialog, check all files you want to commit
- Files will be automatically staged

---

## Step 4: Make Initial Commit

1. In the **Version Control** panel, you'll see a text area for commit message
2. Type your commit message: `Initial commit - WonderLens AI website`
3. Click **`Commit`** button (or press `Ctrl+K` / `Cmd+K`)
4. If prompted about uncommitted changes, click **`Commit`**

---

## Step 5: Add Remote Repository

1. Go to `VCS` → `Git` → `Remotes...`
2. Click the **`+`** button
3. **Name:** `origin`
4. **URL:** Paste your GitHub repository URL (from Step 2)
   - Example: `https://github.com/yourusername/WonderLens_Tech.git`
5. Click **`OK`**

**Alternative via Terminal:**
```bash
git remote add origin https://github.com/yourusername/WonderLens_Tech.git
```

---

## Step 6: Push to GitHub

### Method 1: Via PyCharm UI
1. Go to `VCS` → `Git` → `Push...`
2. You should see your commit listed
3. Select the remote: `origin`
4. Branch: `main` (or `master`)
4. Click **`Push`**
5. If prompted for credentials:
   - **Username:** Your GitHub username
   - **Password:** Use a **Personal Access Token** (not your GitHub password)
     - See "GitHub Authentication" section below

### Method 2: Via Terminal in PyCharm
1. Open terminal in PyCharm: `Alt+F12` (Windows/Linux) or `Option+F12` (Mac)
2. Run:
```bash
git branch -M main
git push -u origin main
```

---

## Step 7: Verify on GitHub

1. Go to your GitHub repository page
2. Refresh the page
3. You should see all your files there! ✅

---

## 🔐 GitHub Authentication

GitHub no longer accepts passwords. You need a **Personal Access Token**:

### Create Personal Access Token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **`Generate new token (classic)`**
3. Give it a name: `PyCharm Push`
4. Select scopes: Check **`repo`** (full control of private repositories)
5. Click **`Generate token`**
6. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)
7. Use this token as your password when PyCharm prompts for credentials

### Save Credentials (Optional):
- PyCharm will ask if you want to save credentials
- Choose **`Yes`** to avoid entering token every time

---

## 🎯 Quick Reference: PyCharm Git Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Open Version Control | `Alt+9` | `Cmd+9` |
| Commit | `Ctrl+K` | `Cmd+K` |
| Push | `Ctrl+Shift+K` | `Cmd+Shift+K` |
| Pull | `Ctrl+T` | `Cmd+T` |
| Open Terminal | `Alt+F12` | `Option+F12` |

---

## 🐛 Troubleshooting

### "Repository not found" error
- Check repository URL is correct
- Verify you have access to the repository
- Make sure repository exists on GitHub

### "Authentication failed"
- Use Personal Access Token, not password
- Check token has `repo` scope enabled
- Token might be expired (create a new one)

### "Branch not found"
- Run: `git branch -M main` (to rename branch to main)
- Then push again

### Files not showing in PyCharm
- Make sure `.gitignore` is not excluding important files
- Check `File` → `Settings` → `Version Control` → `Git` is configured

---

## ✅ Success Checklist

- [ ] Git repository initialized
- [ ] GitHub repository created
- [ ] All files staged
- [ ] Initial commit made
- [ ] Remote added (origin)
- [ ] Code pushed to GitHub
- [ ] Files visible on GitHub

---

## 📝 Next Steps After Pushing

1. **Deploy to Vercel:**
   - Go to Vercel dashboard
   - Import your GitHub repository
   - Follow deployment guide

2. **Set up Environment Variables:**
   - Add Google Sheets credentials in Vercel
   - See `ENV_SETUP.md` for details

3. **Test the Deployment:**
   - Visit your Vercel URL
   - Test the form submission

---

**Need help?** Check the other guides:
- `DEPLOYMENT.md` - Full deployment guide
- `QUICKSTART.md` - Quick start guide
- `CHECKLIST.md` - Pre-deployment checklist
