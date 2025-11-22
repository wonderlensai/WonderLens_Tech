# 🔗 Google Sheets Webhook Setup - Complete Step-by-Step Guide

This guide will walk you through setting up a webhook connection between your WonderLens AI website and Google Sheets to automatically collect demo requests.

**Time Required:** ~10 minutes  
**Difficulty:** Easy (No coding required!)

---

## 📋 Prerequisites

- Google account (Gmail account works)
- Access to Google Sheets
- Your website code ready

---

## Step 1: Create Google Sheet

### 1.1 Create New Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **`+ Blank`** to create a new spreadsheet
3. Name it: **`WonderLens Demo Requests`** (or any name you prefer)

### 1.2 Set Up Headers

1. In **Row 1**, add these column headers (one per cell):

```
| A1: Timestamp | B1: Name | C1: Company | D1: Email | E1: Phone | F1: Industry | G1: Use Case |
```

**Copy-paste ready format:**
```
Timestamp	Name	Company	Email	Phone	Industry	Use Case
```

2. **Bold the headers** (optional but recommended):
   - Select Row 1
   - Click the **B** (Bold) button

3. **Freeze the header row** (optional but recommended):
   - Click on Row 1
   - Go to `View` → `Freeze` → `1 row`

✅ **Your sheet should look like this:**
```
┌─────────────┬──────────┬───────────┬──────────┬──────────┬───────────┬─────────────┐
│ Timestamp   │ Name     │ Company   │ Email    │ Phone    │ Industry  │ Use Case    │
├─────────────┼──────────┼───────────┼──────────┼──────────┼───────────┼─────────────┤
│             │          │           │          │          │           │             │
└─────────────┴──────────┴───────────┴──────────┴──────────┴───────────┴─────────────┘
```

---

## Step 2: Create Google Apps Script

### 2.1 Open Apps Script Editor

1. In your Google Sheet, click **`Extensions`** (top menu)
2. Select **`Apps Script`**
3. A new tab will open with the Apps Script editor

### 2.2 Clear Default Code

1. You'll see a default function like `myFunction()`
2. **Delete all the default code** (select all and delete)

### 2.3 Paste the Webhook Code

1. Open the file `google-apps-script.js` from your project
2. **Copy the entire code** (or copy from below):

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    const timestamp = new Date();
    const row = [
      timestamp,
      data.name || '',
      data.company || '',
      data.email || '',
      data.phone || '',
      data.industry || '',
      data.useCase || ''
    ];
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data saved successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. **Paste it** into the Apps Script editor
4. **Save the project**:
   - Click the **💾 Save** icon (or `Ctrl+S` / `Cmd+S`)
   - Name your project: **`WonderLens Webhook`**
   - Click **`OK`**

✅ **Your Apps Script editor should now show the `doPost` function**

---

## Step 3: Deploy as Web App

### 3.1 Create Deployment

1. In Apps Script editor, click **`Deploy`** (top right)
2. Select **`New deployment`**

### 3.2 Configure Deployment

1. Click the **⚙️ Settings icon** (gear) next to "Select type"
2. Choose **`Web app`** from the dropdown
3. Fill in the deployment settings:

   - **Description:** `WonderLens Demo Form Handler` (optional)
   - **Execute as:** Select **`Me`** (your email)
   - **Who has access:** Select **`Anyone`** ⚠️ (Important!)
   
4. Click **`Deploy`**

### 3.3 Authorize the Script

1. You'll see an **"Authorization required"** dialog
2. Click **`Authorize access`**
3. You may see a warning: **"Google hasn't verified this app"**
   - Click **`Advanced`**
   - Click **`Go to WonderLens Webhook (unsafe)`**
4. Select your Google account
5. Click **`Allow`** to grant permissions

### 3.4 Copy the Web App URL

1. After authorization, you'll see a **"Web app"** dialog
2. **Copy the Web App URL** - it looks like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```
3. **⚠️ IMPORTANT:** Save this URL somewhere safe (you'll need it!)
4. Click **`Done`**

✅ **You now have your webhook URL!**

---

## Step 4: Update Your Code

### 4.1 Switch to Webhook Handler

1. In your project, go to the `api` folder
2. **Rename files:**
   - Rename `api/submit.js` to `api/submit-api.js` (backup)
   - Rename `api/submit-webhook.js` to `api/submit.js` (activate webhook version)

**Or manually copy the webhook code:**

1. Open `api/submit-webhook.js`
2. Copy all its contents
3. Open `api/submit.js`
4. Replace all contents with the webhook code
5. Save

### 4.2 Verify the Code

Your `api/submit.js` should look like this:

```javascript
import { google } from 'googleapis';  // ← This line should be REMOVED

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, company, email, phone, industry, useCase } = req.body;

    if (!name || !email || !company) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const webhookUrl = process.env.GOOGLE_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(500).json({ error: 'Webhook URL not configured' });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        company,
        email,
        phone: phone || '',
        industry: industry || '',
        useCase: useCase || '',
      }),
    });

    const result = await response.json();

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Demo request submitted successfully!',
      });
    } else {
      return res.status(500).json({
        error: result.error || 'Failed to submit form',
      });
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    return res.status(500).json({
      error: 'Failed to submit form. Please try again later.',
    });
  }
}
```

**Note:** The webhook version does NOT need `googleapis` package, so you can remove it from `package.json` if you want (optional).

---

## Step 5: Configure Vercel Environment Variable

### 5.1 Add Environment Variable

1. Go to your **Vercel Dashboard**
2. Select your **WonderLens AI project**
3. Go to **`Settings`** → **`Environment Variables`**
4. Click **`Add New`**
5. Fill in:
   - **Key:** `GOOGLE_WEBHOOK_URL`
   - **Value:** Paste your webhook URL from Step 3.4
   - **Environment:** Select all (Production, Preview, Development)
6. Click **`Save`**

### 5.2 Redeploy (Important!)

1. After adding the environment variable, you **must redeploy**
2. Go to **`Deployments`** tab
3. Click the **`⋯`** (three dots) on your latest deployment
4. Click **`Redeploy`**
5. Wait for deployment to complete

✅ **Your webhook is now connected!**

---

## Step 6: Test the Connection

### 6.1 Test via Browser

1. Visit your deployed website
2. Scroll to the **"Initialize Deployment"** form
3. Fill out the form:
   - Name: `Test User`
   - Company: `Test Company`
   - Email: `test@example.com`
   - Phone: `123-456-7890`
   - Industry: `Manufacturing`
   - Use Case: `Testing webhook connection`
4. Click **`Request System Demo`**
5. You should see a success message: **"✓ Demo request submitted successfully!"**

### 6.2 Verify in Google Sheets

1. Go back to your Google Sheet
2. **Refresh the page** (F5 or Cmd+R)
3. You should see a **new row** with your test data:
   - Column A: Timestamp
   - Column B: Test User
   - Column C: Test Company
   - Column D: test@example.com
   - etc.

✅ **If you see the data, your webhook is working perfectly!**

---

## 🐛 Troubleshooting

### Problem: "Webhook URL not configured" error

**Solution:**
- Verify `GOOGLE_WEBHOOK_URL` is set in Vercel environment variables
- Make sure you redeployed after adding the variable
- Check the variable name is exactly `GOOGLE_WEBHOOK_URL` (case-sensitive)

### Problem: Form submits but no data in sheet

**Solution:**
1. Check Apps Script execution logs:
   - Go to Apps Script editor
   - Click **`Executions`** (left sidebar)
   - Check for any errors
2. Verify the sheet is the "active" sheet:
   - Make sure you're testing on the same sheet where you created the script
3. Check permissions:
   - Make sure the web app is deployed with "Anyone" access
   - Re-authorize if needed

### Problem: "Authorization required" keeps appearing

**Solution:**
1. Delete the old deployment
2. Create a new deployment
3. Make sure "Execute as" is set to "Me"
4. Re-authorize with your Google account

### Problem: CORS errors in browser console

**Solution:**
- This is normal for Google Apps Script webhooks
- The webhook works server-to-server (Vercel → Google)
- Browser CORS doesn't affect functionality

### Problem: Data appears but in wrong columns

**Solution:**
- Check your sheet headers match exactly:
  - Timestamp | Name | Company | Email | Phone | Industry | Use Case
- Verify the Apps Script code matches the column order

---

## ✅ Success Checklist

- [ ] Google Sheet created with proper headers
- [ ] Apps Script code pasted and saved
- [ ] Web app deployed with "Anyone" access
- [ ] Webhook URL copied and saved
- [ ] `api/submit.js` updated to use webhook code
- [ ] `GOOGLE_WEBHOOK_URL` added to Vercel environment variables
- [ ] Project redeployed on Vercel
- [ ] Test submission successful
- [ ] Data appears in Google Sheet

---

## 📝 Next Steps

1. **Monitor submissions:**
   - Set up email notifications in Google Sheets (optional)
   - Add filters to organize data

2. **Customize (optional):**
   - Add more columns to the sheet
   - Update the Apps Script to handle new fields
   - Add data validation

3. **Security (optional):**
   - Consider adding basic authentication
   - Set up rate limiting in Vercel

---

## 🎉 You're Done!

Your webhook is now live and collecting demo requests automatically! Every form submission will instantly appear in your Google Sheet.

**Need help?** Check the error logs in:
- Vercel Function Logs (Vercel Dashboard → Functions)
- Google Apps Script Executions (Apps Script Editor → Executions)
