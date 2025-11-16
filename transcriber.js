// Google Drive Video Transcriber JavaScript
class VideoTranscriber {
  constructor() {
    this.currentVideo = null;
    this.transcriptionResult = "";
    this.isTranscribing = false;
    this.recognition = null;

    this.initializeElements();
    this.setupEventListeners();
    this.setupSpeechRecognition();
  }

  initializeElements() {
    // Upload elements
    this.uploadBox = document.getElementById("uploadBox");
    this.uploadBtn = document.getElementById("uploadBtn");
    this.fileInput = document.getElementById("fileInput");
    this.googleDriveBtn = document.getElementById("googleDriveBtn");

    // Video preview elements
    this.videoPreview = document.getElementById("videoPreview");
    this.videoPlayer = document.getElementById("videoPlayer");
    this.fileName = document.getElementById("fileName");
    this.videoDuration = document.getElementById("videoDuration");
    this.fileSize = document.getElementById("fileSize");

    // Transcription elements
    this.transcriptionSection = document.getElementById("transcriptionSection");
    this.languageSelect = document.getElementById("languageSelect");
    this.qualitySelect = document.getElementById("qualitySelect");
    this.timestampsCheck = document.getElementById("timestampsCheck");
    this.speakerIdCheck = document.getElementById("speakerIdCheck");
    this.transcribeBtn = document.getElementById("transcribeBtn");

    // Progress elements
    this.progressSection = document.getElementById("progressSection");
    this.progressPercent = document.getElementById("progressPercent");
    this.progressFill = document.getElementById("progressFill");
    this.progressStatus = document.getElementById("progressStatus");

    // Results elements
    this.resultsSection = document.getElementById("resultsSection");
    this.transcriptionText = document.getElementById("transcriptionText");
    this.wordCount = document.getElementById("wordCount");
    this.charCount = document.getElementById("charCount");
    this.timeCount = document.getElementById("timeCount");
    this.exportPdfBtn = document.getElementById("exportPdfBtn");
    this.exportTxtBtn = document.getElementById("exportTxtBtn");
    this.copyBtn = document.getElementById("copyBtn");

    // Error elements
    this.errorSection = document.getElementById("errorSection");
    this.errorMessage = document.getElementById("errorMessage");
    this.retryBtn = document.getElementById("retryBtn");

    // Loading overlay
    this.loadingOverlay = document.getElementById("loadingOverlay");
  }

  setupEventListeners() {
    // Upload events
    this.uploadBtn.addEventListener("click", () => this.fileInput.click());
    this.fileInput.addEventListener("change", (e) => this.handleFileSelect(e));
    this.googleDriveBtn.addEventListener("click", () =>
      this.connectToGoogleDrive()
    );

    // Drag and drop events
    this.uploadBox.addEventListener("click", () => this.fileInput.click());
    this.uploadBox.addEventListener("dragover", (e) => this.handleDragOver(e));
    this.uploadBox.addEventListener("dragleave", (e) =>
      this.handleDragLeave(e)
    );
    this.uploadBox.addEventListener("drop", (e) => this.handleDrop(e));

    // Transcription events
    this.transcribeBtn.addEventListener("click", () =>
      this.startTranscription()
    );
    this.retryBtn.addEventListener("click", () => this.retryTranscription());

    // Export events
    this.exportPdfBtn.addEventListener("click", () => this.exportToPDF());
    this.exportTxtBtn.addEventListener("click", () => this.exportToText());
    this.copyBtn.addEventListener("click", () => this.copyToClipboard());

    // Video events
    this.videoPlayer.addEventListener("loadedmetadata", () =>
      this.updateVideoInfo()
    );

    // Text editing events
    this.transcriptionText.addEventListener("input", () =>
      this.updateWordCount()
    );
  }

  setupSpeechRecognition() {
    if ("webkitSpeechRecognition" in window) {
      this.recognition = new webkitSpeechRecognition();
    } else if ("SpeechRecognition" in window) {
      this.recognition = new SpeechRecognition();
    }

    if (this.recognition) {
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  handleDragOver(e) {
    e.preventDefault();
    this.uploadBox.classList.add("dragover");
  }

  handleDragLeave(e) {
    e.preventDefault();
    this.uploadBox.classList.remove("dragover");
  }

  handleDrop(e) {
    e.preventDefault();
    this.uploadBox.classList.remove("dragover");

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      this.processVideoFile(files[0]);
    }
  }

  handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      this.processVideoFile(file);
    }
  }

  async processVideoFile(file) {
    // Validate file type
    if (!file.type.startsWith("video/")) {
      this.showError("Please select a valid video file.");
      return;
    }

    // Validate file size (max 500MB for demo)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      this.showError(
        "File size too large. Please select a video smaller than 500MB."
      );
      return;
    }

    this.currentVideo = file;

    // Create video URL and load
    const videoUrl = URL.createObjectURL(file);
    this.videoPlayer.src = videoUrl;

    // Update file info
    this.fileName.textContent = file.name;
    this.fileSize.textContent = this.formatFileSize(file.size);

    // Show video preview and transcription section
    this.videoPreview.style.display = "block";
    this.transcriptionSection.style.display = "block";
    this.hideError();

    // Scroll to video section
    this.videoPreview.scrollIntoView({ behavior: "smooth" });
  }

  updateVideoInfo() {
    const duration = this.videoPlayer.duration;
    this.videoDuration.textContent = this.formatDuration(duration);
  }

  async connectToGoogleDrive() {
    try {
      this.showLoading();

      // Initialize Google Drive API if not already done
      if (!this.googleDriveAPI) {
        this.googleDriveAPI = new GoogleDriveAPI();
      }

      // Authenticate with Google Drive
      await this.googleDriveAPI.authenticate();

      // Get list of video files
      const result = await this.googleDriveAPI.listVideos(20);
      
      this.hideLoading();

      // Show video picker dialog
      this.showVideoPicker(result.files);

    } catch (error) {
      this.hideLoading();
      
      if (error.message.includes('API credentials')) {
        this.showError('Google Drive API not configured. Please check the setup instructions in the README.');
      } else {
        this.showError('Failed to connect to Google Drive. Please try again.');
      }
      console.error('Google Drive connection error:', error);
    }
  }

  async startTranscription() {
    if (!this.currentVideo) {
      this.showError("Please select a video file first.");
      return;
    }

    if (this.isTranscribing) return;

    this.isTranscribing = true;
    this.transcribeBtn.disabled = true;
    this.transcribeBtn.querySelector(".btn-text").textContent =
      "Transcribing...";
    this.transcribeBtn.querySelector(".btn-loader").style.display = "block";

    // Show progress section
    this.progressSection.style.display = "block";
    this.hideError();

    try {
      // Get transcription settings
      const language = this.languageSelect.value;
      const includeTimestamps = this.timestampsCheck.checked;
      const includeSpeakers = this.speakerIdCheck.checked;

      // Set recognition language
      if (this.recognition) {
        this.recognition.lang = language;
      }

      // Start transcription process
      await this.performTranscription(includeTimestamps, includeSpeakers);
    } catch (error) {
      this.showError("Transcription failed. Please try again.");
      console.error("Transcription error:", error);
    } finally {
      this.isTranscribing = false;
      this.transcribeBtn.disabled = false;
      this.transcribeBtn.querySelector(".btn-text").textContent =
        "Start Transcription";
      this.transcribeBtn.querySelector(".btn-loader").style.display = "none";
      this.progressSection.style.display = "none";
    }
  }

  async performTranscription(includeTimestamps, includeSpeakers) {
    // Simulate transcription process with progress updates
    const steps = [
      { progress: 10, status: "Analyzing audio track..." },
      { progress: 25, status: "Processing speech segments..." },
      { progress: 50, status: "Converting speech to text..." },
      { progress: 75, status: "Applying language model..." },
      { progress: 90, status: "Finalizing transcription..." },
      { progress: 100, status: "Transcription complete!" },
    ];

    for (const step of steps) {
      await this.simulateDelay(1000);
      this.updateProgress(step.progress, step.status);
    }

    // Generate sample transcription (in real implementation, this would be actual transcription)
    this.transcriptionResult = this.generateSampleTranscription(
      includeTimestamps,
      includeSpeakers
    );

    // Show results
    this.showResults();
  }

  generateSampleTranscription(includeTimestamps, includeSpeakers) {
    const baseText = `Welcome to our video presentation. Today we'll be discussing the latest developments in artificial intelligence and machine learning technologies.

The field of AI has seen remarkable progress in recent years, particularly in areas such as natural language processing, computer vision, and predictive analytics.

Machine learning algorithms have become increasingly sophisticated, enabling applications that were once considered science fiction to become reality.

Some key areas of advancement include deep learning neural networks, reinforcement learning systems, and automated machine learning platforms.

These technologies are now being applied across various industries including healthcare, finance, transportation, and entertainment.

The future of AI looks promising with continued research and development in areas such as quantum computing integration and edge AI deployment.

Thank you for watching our presentation. We hope you found this information valuable and look forward to your questions.`;

    let result = baseText;

    if (includeTimestamps) {
      const lines = result.split("\n\n");
      result = lines
        .map((line, index) => {
          const timestamp = this.formatTimestamp(index * 30); // 30 seconds apart
          return `[${timestamp}] ${line}`;
        })
        .join("\n\n");
    }

    if (includeSpeakers) {
      const lines = result.split("\n\n");
      result = lines
        .map((line, index) => {
          const speaker = index % 2 === 0 ? "Speaker 1" : "Speaker 2";
          return `${speaker}: ${line}`;
        })
        .join("\n\n");
    }

    return result;
  }

  showResults() {
    this.transcriptionText.textContent = this.transcriptionResult;
    this.updateWordCount();
    this.resultsSection.style.display = "block";
    this.resultsSection.scrollIntoView({ behavior: "smooth" });
  }

  updateWordCount() {
    const text = this.transcriptionText.textContent || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const readingTime = Math.ceil(words / 200); // 200 words per minute

    this.wordCount.textContent = `${words} words`;
    this.charCount.textContent = `${characters} characters`;
    this.timeCount.textContent = `${readingTime} min read`;
  }

  updateProgress(percentage, status) {
    this.progressPercent.textContent = `${percentage}%`;
    this.progressFill.style.width = `${percentage}%`;
    this.progressStatus.textContent = status;
  }

  async exportToPDF() {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.text("Video Transcription", 20, 30);

      // Add video info
      doc.setFontSize(12);
      doc.text(`File: ${this.fileName.textContent}`, 20, 50);
      doc.text(`Duration: ${this.videoDuration.textContent}`, 20, 65);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 80);

      // Add transcription text
      doc.setFontSize(10);
      const text = this.transcriptionText.textContent;
      const lines = doc.splitTextToSize(text, 170);
      doc.text(lines, 20, 100);

      // Save the PDF
      const fileName =
        this.currentVideo.name.replace(/\.[^/.]+$/, "") + "_transcription.pdf";
      doc.save(fileName);

      this.showSuccessMessage("PDF downloaded successfully!");
    } catch (error) {
      this.showError("Failed to generate PDF. Please try again.");
      console.error("PDF export error:", error);
    }
  }

  async exportToText() {
    try {
      const text = this.transcriptionText.textContent;
      const fileName =
        this.currentVideo.name.replace(/\.[^/.]+$/, "") + "_transcription.txt";

      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showSuccessMessage("Text file downloaded successfully!");
    } catch (error) {
      this.showError("Failed to download text file. Please try again.");
      console.error("Text export error:", error);
    }
  }

  async copyToClipboard() {
    try {
      const text = this.transcriptionText.textContent;
      await navigator.clipboard.writeText(text);
      this.showSuccessMessage("Transcription copied to clipboard!");
    } catch (error) {
      // Fallback for older browsers
      this.selectText(this.transcriptionText);
      document.execCommand("copy");
      this.showSuccessMessage("Transcription copied to clipboard!");
    }
  }

  selectText(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  retryTranscription() {
    this.hideError();
    this.startTranscription();
  }

  showError(message) {
    this.errorMessage.textContent = message;
    this.errorSection.style.display = "block";
    this.resultsSection.style.display = "none";
  }

  hideError() {
    this.errorSection.style.display = "none";
  }

  showLoading() {
    this.loadingOverlay.style.display = "flex";
  }

  hideLoading() {
    this.loadingOverlay.style.display = "none";
  }

  showSuccessMessage(message) {
    // Create a temporary success notification
    const notification = document.createElement("div");
    notification.className = "success-notification";
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease forwards";
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }

  formatFileSize(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, "0")}`;
    }
  }

  formatTimestamp(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  async simulateDelay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Add CSS animations for notifications
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new VideoTranscriber();
});

// Google Drive API integration helper
class GoogleDriveAPI {
  constructor() {
    // Replace these with your actual credentials from Google Cloud Console
    this.apiKey = "YOUR_API_KEY_HERE"; // From Google Cloud Console → Credentials → API Keys
    this.clientId = "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com"; // From OAuth 2.0 Client IDs
    this.discoveryDocs = [
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    ];
    this.scopes = "https://www.googleapis.com/auth/drive.readonly";
    this.isInitialized = false;
    this.isSignedIn = false;
  }

  async initialize() {
    try {
      // Load Google API client
      await this.loadGoogleAPI();

      // Initialize Google API client
      await gapi.client.init({
        apiKey: this.apiKey,
        clientId: this.clientId,
        discoveryDocs: this.discoveryDocs,
        scope: this.scopes,
      });

      this.isInitialized = true;
      this.isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();

      console.log("Google Drive API initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize Google Drive API:", error);
      throw new Error(
        "Google Drive API initialization failed. Please check your API credentials."
      );
    }
  }

  async loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = () => {
        gapi.load("client:auth2", resolve);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

    async authenticate() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            
            const authInstance = gapi.auth2.getAuthInstance();
            
            if (this.isSignedIn) {
                return authInstance.currentUser.get();
            }
            
            const user = await authInstance.signIn();
            this.isSignedIn = true;
            console.log('User signed in successfully');
            return user;
        } catch (error) {
            console.error('Authentication failed:', error);
            throw new Error('Failed to authenticate with Google Drive. Please try again.');
        }
    }

    async signOut() {
        try {
            const authInstance = gapi.auth2.getAuthInstance();
            await authInstance.signOut();
            this.isSignedIn = false;
            console.log('User signed out successfully');
        } catch (error) {
            console.error('Sign out failed:', error);
    }

    async listVideos(pageSize = 20, pageToken = null) {
        try {
            if (!this.isSignedIn) {
                await this.authenticate();
            }
            
            const params = {
                q: "mimeType contains 'video/' and trashed=false",
                fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink)',
                pageSize: pageSize,
                orderBy: 'modifiedTime desc'
            };
            
            if (pageToken) {
                params.pageToken = pageToken;
            }
            
            const response = await gapi.client.drive.files.list(params);
            return {
                files: response.result.files || [],
                nextPageToken: response.result.nextPageToken
            };
        } catch (error) {
            console.error('Failed to list videos:', error);
            throw new Error('Failed to retrieve videos from Google Drive. Please check your permissions.');
        }
    }

    async getFileMetadata(fileId) {
        try {
            const response = await gapi.client.drive.files.get({
                fileId: fileId,
                fields: 'id, name, mimeType, size, createdTime, modifiedTime, description, webViewLink, thumbnailLink'
            });
            return response.result;
        } catch (error) {
            console.error('Failed to get file metadata:', error);
            throw new Error('Failed to get file information.');
        }
    }

    async downloadFile(fileId) {
        try {
            // Get file metadata first
            const metadata = await this.getFileMetadata(fileId);
            
            // For video files, we'll get the download URL
            const response = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });
            
            return {
                data: response.body,
                metadata: metadata
            };
        } catch (error) {
            console.error('Failed to download file:', error);
            throw new Error('Failed to download file from Google Drive.');
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { VideoTranscriber, GoogleDriveAPI };
}
