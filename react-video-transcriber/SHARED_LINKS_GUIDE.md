# Google Drive Shared Links Guide

## 📋 Overview

The React Video Transcriber now supports accessing videos shared with you through Google Drive view-only links! This feature allows you to transcribe videos that others have shared with you without needing to own or upload them yourself.

## ✅ What Works

### 1. **View-Only Links**
- ✅ Videos shared with "Anyone with the link can view"
- ✅ Videos shared directly with your Google account
- ✅ Videos with viewer permissions
- ✅ Videos from shared folders (if you have access)

### 2. **Supported Link Formats**
```
https://drive.google.com/file/d/FILE_ID/view
https://drive.google.com/open?id=FILE_ID
https://docs.google.com/document/d/FILE_ID/
```

### 3. **File Types Supported**
- MP4, AVI, MOV, WMV, WebM, MKV
- Any video format supported by Google Drive

## 🚫 Limitations

### 1. **What Won't Work**
- ❌ Videos with download disabled by owner
- ❌ Videos requiring additional permissions
- ❌ Expired or revoked share links
- ❌ Videos in private folders without explicit access

### 2. **Size & Bandwidth Limits**
- Large files (>500MB) may have slower processing
- Google Drive API has daily quotas
- Streaming quality depends on your internet connection

## 🔧 How to Use

### Step 1: Get the Share Link
1. Someone shares a Google Drive video with you
2. Copy the share link they provide
3. Make sure you have view access to the file

### Step 2: Use in the App
1. Open the React Video Transcriber
2. Sign in to your Google account (required)
3. Scroll down to "Use Shared Video Link" section
4. Paste the link in the input field
5. Click "Access Video"

### Step 3: Transcription Process
1. The app will verify access and load video metadata
2. Configure your transcription settings
3. Start transcription as normal
4. Download results as PDF or text

## 🛡️ Privacy & Security

### Your Data
- ✅ No video files are stored on our servers
- ✅ Transcription happens in your browser
- ✅ Only metadata is accessed through Google Drive API
- ✅ Share links are not saved or logged

### Permissions Required
- **Google Drive API**: Read-only access to files you can view
- **OAuth 2.0**: Secure authentication with Google
- **No Download**: We don't download or store the actual video files

## 🔑 API Setup Required

To use this feature, you need to configure Google Drive API credentials:

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Drive API

### 2. Configure OAuth 2.0
1. Create OAuth 2.0 credentials
2. Add your domain to authorized origins
3. Set redirect URIs appropriately

### 3. Update App Configuration
Edit `src/contexts/GoogleDriveContext.js`:
```javascript
const GOOGLE_DRIVE_CONFIG = {
  apiKey: 'YOUR_ACTUAL_API_KEY',
  clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  // ... rest of config
};
```

## 🐛 Troubleshooting

### Common Issues

#### "Access Denied" Error
**Cause**: You don't have permission to view the file
**Solution**: 
- Ask the owner to check sharing settings
- Ensure you're signed in to the correct Google account
- Verify the link hasn't expired

#### "File Not Found" Error
**Cause**: Link is invalid or file was deleted
**Solution**:
- Double-check the link format
- Ask the owner to reshare the file
- Try copying the link again

#### "Not a Video File" Error
**Cause**: The shared file is not a video
**Solution**:
- Verify the file type with the owner
- Only video files can be transcribed

#### "Connection Failed" Error
**Cause**: API configuration or network issues
**Solution**:
- Check your internet connection
- Verify API credentials are correctly set
- Try refreshing the page

### Network Issues
- **Slow Loading**: Large files may take time to process
- **Timeout**: Try again with a smaller file or better connection
- **Quota Exceeded**: Google Drive API has daily limits

## 📱 Mobile Support

The shared link feature works on mobile devices with some considerations:

### Mobile Browsers
- ✅ Chrome, Safari, Firefox supported
- ✅ Responsive design adapts to screen size
- ⚠️ Large files may use significant data

### Mobile Tips
- Use WiFi for better performance
- Ensure stable connection during transcription
- Consider battery life for long transcriptions

## 🔄 Update Instructions

If you're updating from the previous version:

1. **Update Components**: New VideoUpload component with shared link support
2. **Update Context**: Enhanced GoogleDriveContext with link parsing
3. **Update CSS**: New styles for shared link interface
4. **Test Integration**: Verify API credentials work with new features

## 💡 Best Practices

### For Sharing (File Owners)
1. **Share Properly**: Use "Anyone with the link can view" for easiest access
2. **Include Instructions**: Tell recipients they need to sign in to Google
3. **Check Permissions**: Ensure view access is sufficient for their needs
4. **Consider File Size**: Larger files may be slower to transcribe

### For Users (Link Recipients)
1. **Sign In First**: Always sign in to your Google account before using shared links
2. **Check Connection**: Ensure stable internet for large files
3. **Verify Access**: Test the link in Google Drive first if having issues
4. **Be Patient**: Large files or slow connections may take time

## 🆘 Support

If you encounter issues:

1. **Check this guide** for common solutions
2. **Verify API setup** in Google Cloud Console
3. **Test with different files** to isolate the issue
4. **Check browser console** for technical error details

## 🔄 Future Enhancements

Planned improvements:
- Batch processing multiple shared links
- Support for Google Drive folder links
- Enhanced error messages with specific solutions
- Progress indicators for large file access
- Offline transcription capabilities

---

**Note**: This feature requires proper Google Drive API setup and user authentication. The application respects all Google Drive sharing permissions and privacy settings.