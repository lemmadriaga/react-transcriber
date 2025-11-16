# 🚀 Google Drive API Setup Guide

## Quick Answer: **YES, it's FREE!** 
Google Drive API has generous free quotas that cover most personal and small business use cases.

## 💰 Pricing Overview

### Free Tier (More than enough for personal use):
- ✅ **1 billion API calls per day** 
- ✅ **100 requests per 100 seconds per user**
- ✅ **1,000 requests per 100 seconds total**

### Paid Tier (Only if you exceed free limits):
- $0.10 per 1,000 requests (after free quota)
- For a video transcriber, you'd need to process thousands of videos daily to hit paid tier

---

## 🔧 Step-by-Step Setup

### 1. Create Google Cloud Project

1. **Go to Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com/)

2. **Create New Project**:
   ```
   Project Name: Video Transcriber
   Organization: (Leave default or select your organization)
   Location: (Leave default)
   ```

3. **Click "Create"** and wait for project creation

### 2. Enable Google Drive API

1. **Navigate**: APIs & Services → Library
2. **Search**: "Google Drive API"
3. **Click**: Google Drive API result
4. **Click**: "Enable" button
5. **Wait**: For API to be enabled (usually instant)

### 3. Configure OAuth Consent Screen

1. **Navigate**: APIs & Services → OAuth consent screen
2. **Select**: "External" (for personal use)
3. **Fill Required Fields**:
   ```
   App name: Video Transcriber
   User support email: your-email@gmail.com
   Developer contact: your-email@gmail.com
   ```
4. **Scopes**: Click "Add or Remove Scopes"
   - Select: `../auth/drive.readonly` (View files in your Google Drive)
5. **Test Users**: Add your email address
6. **Click**: "Save and Continue" through all steps

### 4. Create OAuth 2.0 Credentials

1. **Navigate**: APIs & Services → Credentials
2. **Click**: "Create Credentials" → "OAuth 2.0 Client IDs"
3. **Configure**:
   ```
   Application type: Web application
   Name: Video Transcriber Web Client
   ```
4. **Authorized JavaScript origins**:
   ```
   http://localhost:8080
   http://127.0.0.1:8080
   https://your-domain.com (for production)
   ```
5. **Authorized redirect URIs** (optional for this app):
   ```
   http://localhost:8080
   ```
6. **Click**: "Create"
7. **Copy**: Client ID (looks like: `123456-abcdef.apps.googleusercontent.com`)

### 5. Create API Key (Optional - for enhanced features)

1. **Navigate**: APIs & Services → Credentials
2. **Click**: "Create Credentials" → "API Key"
3. **Copy**: API Key (looks like: `AIzaSyA...`)
4. **Click**: "Restrict Key"
5. **API Restrictions**: Select "Google Drive API"
6. **Save**: Changes

---

## 🔑 Update Your Code

### Update `transcriber.js`

Find these lines in your `transcriber.js` file:

```javascript
// Replace these with your actual credentials from Google Cloud Console
this.apiKey = 'YOUR_API_KEY_HERE'; 
this.clientId = 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';
```

**Replace with your actual credentials:**

```javascript
// Replace with your actual credentials
this.apiKey = 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q'; // Your API Key
this.clientId = '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com'; // Your Client ID
```

### Example Configuration:
```javascript
class GoogleDriveAPI {
    constructor() {
        // 🔑 YOUR ACTUAL CREDENTIALS GO HERE
        this.apiKey = 'AIzaSyDGH8j9KlMnOpQrStUvWxYz123456789'; // From API Keys section
        this.clientId = '987654321-xyz123abc456def789ghi.apps.googleusercontent.com'; // From OAuth 2.0 Client IDs
        
        // ✅ These stay the same
        this.discoveryDocs = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
        this.scopes = 'https://www.googleapis.com/auth/drive.readonly';
        this.isInitialized = false;
        this.isSignedIn = false;
    }
}
```

---

## 🧪 Testing Your Setup

### 1. Run Local Server

```bash
# Using Python 3
python -m http.server 8080

# Using Python 2  
python -m SimpleHTTPServer 8080

# Using Node.js
npx http-server -p 8080

# Using PHP
php -S localhost:8080
```

### 2. Test in Browser

1. **Open**: `http://localhost:8080/transcriber.html`
2. **Click**: "Connect to Google Drive"
3. **Expected**: Google OAuth popup appears
4. **Sign in**: With your Google account
5. **Expected**: File picker shows your videos

### 3. Troubleshooting Common Issues

**"Access blocked: This app's request is invalid"**
```
Solution: Check OAuth consent screen configuration
Verify: Authorized JavaScript origins include http://localhost:8080
```

**"Error 403: access_denied"**
```
Solution: Add yourself as test user in OAuth consent screen
Verify: Your email is in "Test users" section
```

**"Invalid client: no application name"**
```
Solution: Complete OAuth consent screen setup
Required: App name, user support email, developer contact
```

**"API key not valid"** 
```
Solution: Check API key restrictions
Verify: Google Drive API is allowed for this key
```

---

## 🔒 Security Best Practices

### For Development:
```javascript
// ✅ Good - Environment variables
const API_KEY = process.env.GOOGLE_API_KEY;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// ❌ Bad - Hardcoded in source
const API_KEY = 'AIzaSyA123...'; // Don't commit to Git!
```

### For Production:
1. **Use environment variables** for credentials
2. **Restrict API keys** to specific domains
3. **Use HTTPS** for all OAuth redirects
4. **Regularly rotate** API keys
5. **Monitor usage** in Google Cloud Console

---

## 📊 Monitoring Your Usage

### Google Cloud Console Dashboard:
1. **Navigate**: APIs & Services → Dashboard
2. **View**: Request count, quota usage, errors
3. **Monitor**: Daily/monthly usage trends

### Quota Limits:
```
✅ Free: 1,000,000,000 requests/day
✅ Per-user: 100 requests/100 seconds
✅ Total: 1,000 requests/100 seconds
```

### Cost Calculator:
- **Average video transcription**: 2-5 API calls
- **Daily capacity**: ~200,000+ videos (free tier)
- **Monthly cost**: $0 for typical usage

---

## 🚀 Ready to Go!

After completing these steps:

1. ✅ **Google Drive API enabled**
2. ✅ **OAuth consent screen configured** 
3. ✅ **Credentials created and added to code**
4. ✅ **Local server running on port 8080**
5. ✅ **Testing completed successfully**

**Your video transcriber is now connected to Google Drive!**

---

## 📞 Need Help?

### Common Resources:
- [Google Drive API Documentation](https://developers.google.com/drive)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

### Quick Debug Checklist:
- [ ] Project created in Google Cloud Console
- [ ] Google Drive API enabled
- [ ] OAuth consent screen completed
- [ ] OAuth 2.0 credentials created
- [ ] Authorized origins include localhost:8080
- [ ] API key created and restricted
- [ ] Credentials updated in transcriber.js
- [ ] Local server running on port 8080
- [ ] Browser allows third-party cookies

---

**🎉 Congratulations! You now have a fully functional Google Drive integrated video transcriber that's free to use for personal projects!**