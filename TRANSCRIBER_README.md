# Google Drive Video Transcriber

A comprehensive web application for transcribing private videos from Google Drive with the ability to download transcriptions as PDF or text files.

## Features

🎥 **Video Upload & Preview**

- Drag & drop video file upload
- Support for all major video formats
- Real-time video preview with metadata
- File size and duration display

🎙️ **Advanced Transcription**

- Multi-language support (English, Spanish, French, German, etc.)
- Quality settings (Standard, Enhanced, Premium)
- Optional timestamps
- Speaker identification
- Real-time progress tracking

📄 **Export Options**

- Download as PDF with formatted layout
- Export as plain text file
- Copy to clipboard functionality
- Editable transcription results

🔗 **Google Drive Integration**

- Direct connection to Google Drive
- Access to private videos
- Secure authentication
- File browser interface

## Installation

1. **Clone or download** the project files to your local directory:

   ```
   transcriber.html
   transcriber-styles.css
   transcriber.js
   ```

2. **Open the HTML file** in your web browser:

   ```
   Double-click transcriber.html or open it with your preferred browser
   ```

3. **For Google Drive integration**, you'll need to:
   - Set up Google Drive API credentials
   - Replace placeholder API keys in the JavaScript file
   - Enable the Google Drive API in Google Cloud Console

## Usage

### Basic Video Transcription

1. **Upload Video**:

   - Click "Choose Video File" or drag and drop a video file
   - Supported formats: MP4, AVI, MOV, WMV, etc.
   - Maximum file size: 500MB

2. **Configure Settings**:

   - Select transcription language
   - Choose quality level
   - Enable/disable timestamps
   - Enable/disable speaker identification

3. **Start Transcription**:

   - Click "Start Transcription"
   - Monitor progress in real-time
   - Wait for completion

4. **Export Results**:
   - Edit transcription if needed
   - Download as PDF or TXT
   - Copy to clipboard

### Google Drive Integration

1. **Connect to Google Drive**:

   - Click "Connect to Google Drive"
   - Authenticate with your Google account
   - Browse and select video files

2. **Process Private Videos**:
   - Access your private Google Drive videos
   - Select video for transcription
   - Follow the same transcription process

## Technical Specifications

### Browser Support

- Chrome 60+ (recommended)
- Firefox 55+
- Safari 11+
- Edge 79+

### File Formats Supported

- MP4, AVI, MOV, WMV
- WebM, MKV, FLV
- Maximum size: 500MB

### Languages Supported

- English (US/UK)
- Spanish, French, German
- Italian, Portuguese (Brazil)
- Japanese, Korean
- Chinese (Simplified)

## API Requirements

### Google Drive API Setup

1. **Create Google Cloud Project**:

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google Drive API

2. **Configure OAuth 2.0**:

   ```javascript
   // Replace in transcriber.js
   const apiKey = "YOUR_GOOGLE_API_KEY";
   const clientId = "YOUR_GOOGLE_CLIENT_ID";
   ```

3. **Set Authorized Origins**:
   - Add your domain to authorized JavaScript origins
   - For local development: `http://localhost:8080`

### Speech Recognition API

The application uses the browser's built-in Web Speech API for transcription. For production use, consider integrating:

- Google Cloud Speech-to-Text API
- Microsoft Azure Speech Service
- Amazon Transcribe
- Rev.ai API

## Customization

### Styling

Modify `transcriber-styles.css` to customize:

- Color scheme
- Layout and spacing
- Button styles
- Progress indicators

### Functionality

Extend `transcriber.js` to add:

- Additional export formats
- Enhanced language support
- Custom transcription engines
- Advanced editing features

## Security Considerations

1. **File Privacy**:

   - Videos are processed locally when possible
   - No files are uploaded to external servers without consent
   - Google Drive access requires explicit user permission

2. **Data Protection**:
   - Transcriptions are stored locally
   - No persistent data storage without user consent
   - Secure API communication over HTTPS

## Troubleshooting

### Common Issues

**Video won't upload**:

- Check file size (must be under 500MB)
- Verify file format is supported
- Ensure browser supports File API

**Transcription fails**:

- Check browser permissions for microphone
- Verify internet connection
- Try a different quality setting

**Google Drive connection fails**:

- Verify API keys are correctly set
- Check Google Cloud Console permissions
- Ensure OAuth consent screen is configured

**Export not working**:

- Check browser supports download APIs
- Verify popup blocker isn't preventing downloads
- Try different export format

### Browser Permissions

The application may require:

- File system access for downloads
- Microphone access for speech recognition
- Storage access for temporary files

## Development

### Local Development Server

For testing Google Drive integration, run a local server:

```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080

# Node.js
npx http-server -p 8080
```

Then access: `http://localhost:8080/transcriber.html`

### Testing

1. **Upload Test**: Try various video formats and sizes
2. **Transcription Test**: Test different languages and settings
3. **Export Test**: Verify PDF and text downloads
4. **Google Drive Test**: Test authentication and file access

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review browser console for errors
3. Verify API configurations
4. Test with different files and settings

## Roadmap

- [ ] Real-time transcription during video playback
- [ ] Batch processing for multiple files
- [ ] Advanced editing with timeline sync
- [ ] Integration with cloud storage services
- [ ] Mobile app version
- [ ] Collaborative editing features

---

**Note**: This is a client-side application that prioritizes user privacy and data security. For production deployment, ensure proper API security and consider implementing server-side processing for enhanced features.
