# Google Classroom Video Transcription Guide

## Overview
This guide explains how to transcribe videos that are shared with you through Google Classroom, specifically for UP (University of the Philippines) students or any educational institution using Google Classroom.

## 📚 Understanding Google Classroom Video Sharing

When instructors share videos in Google Classroom, they typically:
- Store videos in Google Drive with restricted access
- Share them through classroom posts or assignments
- Limit access to enrolled students only
- May disable downloading for copyright protection

## 🔐 Prerequisites

### 1. Authentication Requirements
- **Student Google Account**: You must be signed in to your institutional Google account (e.g., `yourname@up.edu.ph`)
- **Classroom Enrollment**: You must be enrolled in the specific Google Classroom
- **Video Permissions**: The video must be shared with "view" permissions

### 2. Google Drive API Setup
Before using the application, you need to:

1. **Get Google Drive API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google Drive API
   - Create credentials (API Key)

2. **Configure OAuth 2.0**:
   - Add your domain to authorized origins
   - Set redirect URIs for your app
   - Download client configuration

3. **Update App Configuration**:
   ```javascript
   // In src/contexts/GoogleDriveContext.js
   const CLIENT_ID = 'your-google-client-id';
   const API_KEY = 'your-google-api-key';
   ```

## 📖 How to Get Video Links from Google Classroom

### Method 1: From Classroom Post
1. **Open Google Classroom**
2. **Navigate to the class** with the video
3. **Find the post** containing the video
4. **Click on the video attachment**
5. **Copy the URL** from your browser address bar
6. **Paste in the app's shared link field**

### Method 2: From Assignment
1. **Open the assignment** with video materials
2. **Click on the video file**
3. **Right-click and select "Copy link address"** (or copy from address bar)
4. **Use this link in the transcription app**

### Method 3: Direct Drive Access
1. **Open the video in Google Drive** (if accessible)
2. **Click "Share" button**
3. **Copy the shareable link**
4. **Ensure permissions are set to "Anyone with the link can view"**

## 🔗 Supported Link Formats

The application can handle these Google Classroom video link formats:

### Google Classroom Links:
```
https://classroom.google.com/c/[CLASS_ID]/p/[POST_ID]
https://classroom.google.com/c/[CLASS_ID]/a/[ASSIGNMENT_ID]
https://classroom.google.com/c/[CLASS_ID]/m/[MATERIAL_ID]
```

### Google Drive Links (from Classroom):
```
https://drive.google.com/file/d/[FILE_ID]/view
https://drive.google.com/open?id=[FILE_ID]
https://drive.google.com/uc?id=[FILE_ID]
```

### Classroom Attachment URLs:
```
https://classroom.google.com/c/[CLASS_ID]/p/[POST_ID]/attachments/[ATTACHMENT_ID]
```

## 🚀 Step-by-Step Transcription Process

### Step 1: Prepare Your Environment
1. **Sign in to Google** with your student account
2. **Open Google Classroom** in one tab
3. **Open the transcription app** in another tab
4. **Connect your Google Drive** in the app

### Step 2: Get the Video Link
1. **Navigate to your classroom**
2. **Find the video you want to transcribe**
3. **Copy the video URL** using one of the methods above

### Step 3: Use the Transcription App
1. **Paste the link** in the "Access Shared Video" section
2. **Click "Access Video"** 
3. **Grant permissions** if prompted
4. **Configure transcription settings**
5. **Start transcription**

### Step 4: Export Results
1. **Review the transcription**
2. **Edit if necessary**
3. **Export as PDF or text file**
4. **Save for your studies**

## ⚠️ Common Issues and Solutions

### Issue 1: "Access Denied" Error
**Cause**: Insufficient permissions or not signed in to correct account
**Solution**: 
- Ensure you're signed in to your student Google account
- Check if you're enrolled in the classroom
- Ask instructor to verify sharing permissions

### Issue 2: "File Not Found" Error
**Cause**: Invalid link or file moved/deleted
**Solution**:
- Verify the link is copied correctly
- Check if the video is still available in classroom
- Try accessing the video directly in classroom first

### Issue 3: "Download Restricted" Error
**Cause**: Instructor has disabled downloading
**Solution**:
- Use screen recording as alternative
- Ask instructor for download permissions
- Try different video format if available

### Issue 4: Large File Timeout
**Cause**: Video file is too large for processing
**Solution**:
- Use shorter video segments
- Check internet connection
- Try during off-peak hours

## 🎓 Tips for UP Students

### Maximize Learning Efficiency:
1. **Transcribe lectures** for better note-taking
2. **Search transcriptions** for specific topics
3. **Create study guides** from transcribed content
4. **Share summaries** with classmates (respecting academic policies)

### Best Practices:
1. **Respect copyright** - only transcribe for personal academic use
2. **Follow academic integrity** policies of your institution
3. **Keep transcriptions secure** - don't share copyrighted content
4. **Credit sources** appropriately in your work

### Time Management:
1. **Batch process videos** during free time
2. **Use timestamps** to navigate long lectures
3. **Highlight key concepts** in transcriptions
4. **Sync with your study schedule**

## 🔧 Troubleshooting API Configuration

### If Google Drive API is not working:

1. **Check API Quotas**:
   - Visit Google Cloud Console
   - Monitor API usage and limits
   - Upgrade if necessary for heavy usage

2. **Verify Permissions**:
   - Ensure proper OAuth scopes are set
   - Check API credentials are not expired
   - Verify domain restrictions

3. **Test Authentication**:
   - Try connecting to Google Drive manually
   - Check browser console for error messages
   - Verify redirect URLs match configuration

## 📞 Getting Help

### For Technical Issues:
- Check browser console for error messages
- Verify Google Drive API configuration
- Test with public Google Drive videos first

### For Academic Use:
- Consult your institution's IT support
- Ask instructors about video sharing policies
- Contact library services for research assistance

### For UP-Specific Help:
- Contact UPLB/UPD/UP system IT services
- Check university learning management system guides
- Reach out to academic computing centers

## 📝 Legal and Ethical Considerations

### Academic Use Only:
- This tool is intended for educational purposes
- Respect intellectual property rights
- Follow your institution's academic integrity policies
- Don't distribute copyrighted lecture content

### Privacy and Security:
- Keep your Google credentials secure
- Don't share API keys or access tokens
- Be mindful of sensitive content in videos
- Follow university data handling policies

---

**Note**: This guide assumes you have proper authorization to access and transcribe the educational content. Always respect copyright laws and institutional policies.