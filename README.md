# Video Transcriber Pro - Chrome Extension

A high-accuracy Chrome extension for transcribing videos from Google Drive with real-time speech recognition. Built with modern design using **Tailwind CSS**, **Poppins font**, and **Flaticon** for a beautiful user experience.

## ✨ Design Features

🎨 **Modern UI**: Built with Tailwind CSS for a sleek, professional interface  
📖 **Beautiful Typography**: Uses Poppins font for excellent readability  
🔄 **Modern Icons**: Flaticon integration for crisp, modern iconography  
🌈 **Gradient Design**: Beautiful gradient backgrounds and glass morphism effects  
🌙 **Dark Mode Support**: Automatic dark mode detection and support  
♿ **Accessibility**: High contrast mode and reduced motion support  
📱 **Responsive**: Optimized for different screen sizes

---

💖 **Made with love by Lemuel Madriaga for Allyson Cabading - Madriaga (soon) 💍**

---

## Features

🎙️ **Real-time Transcription**: Live transcription of Google Drive videos with high accuracy
🎬 **Full Video Transcription**: Transcribe entire videos without needing to watch them
📝 **Multiple Language Support**: Support for 10+ languages including English, Spanish, French, German, and more
⚡ **Live Preview**: Real-time transcription preview in a floating overlay
📊 **Speaker Identification**: Optional speaker labeling for multi-person conversations
⏰ **Timestamps**: Optional timestamp inclusion for better organization
📋 **Export Options**: Download transcripts as text files or copy to clipboard
🎛️ **Customizable Settings**: Adjustable language, punctuation, and formatting options
🔒 **Privacy-Focused**: All processing happens locally in your browser

## Transcription Modes

### Live Transcription Mode

- Requires playing the video
- Real-time transcription as the video plays
- Best for shorter videos or when you want to watch while transcribing
- Lower resource usage

### Full Video Transcription Mode ⭐ **NEW**

- **No need to watch or play the video**
- Processes the entire video automatically
- Extracts audio and transcribes in chunks
- Perfect for long videos, meetings, or when you just need the text
- Works completely in the background

## Installation

### Method 1: Load as Unpacked Extension (Development)

1. **Download the Extension**

   - Download all the files from this folder
   - Make sure you have all these files:
     - `manifest.json`
     - `popup.html`
     - `popup.js`
     - `background.js`
     - `content.js`
     - `styles.css`
     - `icons/` folder with included icon files (icon16.png, icon48.png, icon128.png)

2. **Open Chrome Extensions Page**

   - Open Google Chrome
   - Go to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner

3. **Load the Extension**

   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in the Chrome toolbar
   - Find "Video Transcriber Pro" and click the pin icon

### Method 2: Custom Icon Files (Optional)

The extension comes with beautiful gradient microphone icons, but if you want to customize them, you can replace these files in the `icons/` folder:

- `icon16.png` (16x16 pixels) - Toolbar icon
- `icon48.png` (48x48 pixels) - Extension management page
- `icon128.png` (128x128 pixels) - Chrome Web Store and installation

You can use any image editing software or online icon generators to create these. The current icons feature a purple-to-blue gradient background with a white microphone symbol.## How to Use

### Method 1: Full Video Transcription (Recommended for most use cases)

1. **Navigate to Google Drive**

   - Go to `drive.google.com`
   - Open any video file (MP4, MOV, etc.)

2. **Start Full Video Transcription**

   - Click the Video Transcriber Pro icon in the toolbar
   - Configure your settings (language, timestamps, etc.)
   - Click "🎬 Transcribe Entire Video"
   - **No need to play or watch the video!**
   - The extension will automatically extract audio and process it

3. **Monitor Progress**

   - Watch the progress indicator for audio extraction and transcription
   - Live preview shows transcription as it's processed
   - The process continues in the background

### Method 2: Live Transcription (Real-time)

1. **Navigate to Google Drive**

   - Go to `drive.google.com`
   - Open any video file (MP4, MOV, etc.)

2. **Start Live Transcription**

   - Click the Video Transcriber Pro icon in the toolbar
   - Select "Live Transcription" mode in settings
   - Configure your settings (language, timestamps, etc.)
   - Click "Start Live Transcription"
   - **Play the video** to begin transcription

3. **View Live Transcription**

   - A floating overlay will appear showing real-time transcription
   - The overlay is draggable and can be repositioned
   - Live text preview is also available in the popup

### Downloading Results

4. **Download or Copy Results**
   - Once complete, download the transcript as a text file
   - Or copy the text directly to your clipboard

## Supported Features

### Languages

- English (US/UK)
- Spanish
- French
- German
- Italian
- Portuguese (Brazil)
- Japanese
- Korean
- Chinese (Simplified)

### Settings

- **Auto-punctuation**: Automatically adds punctuation to transcripts
- **Timestamps**: Includes time markers for better organization
- **Speaker identification**: Attempts to identify different speakers (experimental)

### Export Formats

- Plain text (TXT)
- Clipboard copy
- Timestamped format

## Browser Compatibility

- **Chrome**: Full support (recommended)
- **Edge**: Full support
- **Firefox**: Limited support (Web Speech API restrictions)
- **Safari**: Not supported (no Web Speech API)

## Privacy & Security

- **Local Processing**: All transcription happens in your browser
- **No Data Transmission**: Audio is not sent to external servers
- **Google Drive Integration**: Only reads video content, no file access
- **Secure Storage**: Transcripts stored locally in browser storage

## Technical Requirements

- Chrome 25+ or Edge 79+
- Microphone permissions (for speech recognition)
- Active internet connection (for accessing Google Drive)
- JavaScript enabled

## Troubleshooting

### "No video found on this page"

- Make sure you're on a Google Drive video page
- Refresh the page and try again
- Check that the video is fully loaded

### "Web Speech API not supported"

- Update your browser to the latest version
- Try using Chrome or Edge instead of Firefox/Safari
- Check that JavaScript is enabled

### Transcription not starting

- Grant microphone permissions when prompted
- Check that your microphone is working
- Try refreshing the page and reloading the extension

### Poor transcription accuracy

- Ensure clear audio quality
- Reduce background noise
- Try adjusting the language setting
- Speak clearly and at a moderate pace

## Known Limitations

- Requires active internet connection for speech recognition
- Accuracy depends on audio quality and speaker clarity
- Some video formats may not be fully supported
- Cross-origin video restrictions may apply to embedded content

## Version History

### v1.0.0 (Initial Release)

- Real-time video transcription
- Multiple language support
- Live preview overlay
- Export functionality
- Google Drive integration

## Support

For issues, suggestions, or feature requests:

1. Check the troubleshooting section above
2. Verify all files are properly installed
3. Check browser console for error messages
4. Ensure microphone permissions are granted

## License

This extension is provided as-is for educational and personal use. Please respect copyright laws and terms of service for the videos you transcribe.

---

**Note**: This extension uses the browser's built-in Web Speech Recognition API, which may send audio to speech recognition services. Check your browser's privacy settings for more information.
