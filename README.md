# Video Transcriber Pro

A modern Chrome extension for high-accuracy video transcription of Google Drive videos with beautiful UI design.

## Features

- **Real-time transcription** of Google Drive videos using Web Speech Recognition API
- **Full video transcription** without needing to play the entire video
- **Modern design** with glass morphism effects and gradient backgrounds
- **Multi-language support** with 12+ languages including English, Spanish, French, German, Japanese, etc.
- **Progress tracking** with visual progress bars and status indicators
- **Download transcripts** as text files for offline use
- **Continuous recognition** for uninterrupted transcription
- **Chrome CSP compliant** with self-contained styling (no external CDN dependencies)

## Personal Touch

Made with 💜 by **Lemuel Madriaga** for **Allyson Cabading - Madriaga** (soon)

## Installation

1. Download or clone this extension folder
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your toolbar

## Usage

### Real-time Transcription
1. Navigate to any Google Drive video
2. Click the extension icon to open the popup
3. Select your preferred language from the dropdown
4. Click "Start Transcription" to begin real-time transcription
5. The transcription will appear in the Live Preview area
6. Click "Stop" to end the session
7. Download the transcript using the "Download Transcript" button

### Full Video Transcription
1. Navigate to a Google Drive video
2. Click "Transcribe Full Video" for complete transcription without playback
3. The extension will extract audio and process it in chunks
4. Monitor progress with the visual progress bar
5. Download the complete transcript when finished

## Supported Languages

- English (US/UK)
- Spanish
- French
- German
- Italian
- Portuguese (Brazil)
- Japanese
- Korean
- Chinese (Simplified)
- Arabic
- Russian
- And more...

## Technical Details

### Architecture
- **Manifest V3** for modern Chrome extension standards
- **Web Speech Recognition API** for high-accuracy transcription
- **Audio Context API** for advanced audio processing
- **Chrome Storage API** for settings persistence
- **Self-contained CSS** for CSP compliance (no external dependencies)

### Files Structure
- `manifest.json` - Extension configuration and permissions
- `popup.html` - Modern UI interface with glass morphism design
- `popup.js` - Main popup logic and user interactions
- `content.js` - Video detection and transcription processing
- `background.js` - Service worker for background tasks
- `styles.css` - Advanced styling for content script overlays
- `icons/` - Extension icons (16px, 48px, 128px) with gradient design

### Design Features
- **Glass morphism effects** with backdrop blur
- **Gradient backgrounds** with purple-blue color scheme
- **Animated status indicators** with pulse effects
- **Custom scrollbars** with branded styling
- **Progress visualization** with smooth animations
- **Responsive design** optimized for popup interface
- **Accessibility features** with proper contrast and focus states

### CSP Compliance
This extension is fully Content Security Policy compliant:
- No external CDN dependencies (Tailwind CSS was replaced with custom CSS)
- All fonts and icons are handled locally or via CSP-allowed sources
- Modern emoji icons used instead of external icon fonts
- Self-contained styling for optimal security

## Browser Requirements

- Chrome 88+ (required for Manifest V3)
- Secure context (HTTPS) for Web Speech Recognition API
- Microphone permissions for speech recognition
- Google Drive access for video transcription

## Privacy & Security

- All transcription processing happens locally in your browser
- No data is sent to external servers
- Uses Chrome's built-in speech recognition
- Minimal permissions for enhanced security
- Works with private Google Drive videos

## Troubleshooting

### Extension not loading
- Ensure all files are in the same directory
- Check that icons folder contains all three PNG files
- Reload the extension in chrome://extensions/

### Transcription not working
- Ensure microphone permissions are granted
- Check that you're on a Google Drive video page
- Verify internet connection for speech recognition
- Make sure the video has audio content

### UI not displaying correctly
- The extension now uses self-contained CSS for full compatibility
- No external CDNs are required
- All modern styling is embedded in the popup

## Future Enhancements

- Additional language support
- Export to multiple formats (PDF, DOCX)
- Timestamp support for longer videos
- Speaker identification for multi-person videos
- Integration with other video platforms

## Version History

### v1.0.0
- Initial release with modern UI design
- Real-time and full video transcription
- Multi-language support
- Glass morphism design with gradients
- CSP-compliant self-contained styling
- Professional icon set with gradient microphone design

---

*Extension created with love for modern video transcription needs* ✨