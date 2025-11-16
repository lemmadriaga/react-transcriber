// Popup script for Video Transcriber Pro
class TranscriptionPopup {
  constructor() {
    this.isTranscribing = false;
    this.transcript = "";
    this.initializeElements();
    this.attachEventListeners();
    this.loadSettings();
    this.updateUI();
  }

  initializeElements() {
    this.elements = {
      status: document.getElementById("status"),
      progressContainer: document.getElementById("progress-container"),
      progressBar: document.getElementById("progress-bar"),
      progressText: document.getElementById("progress-text"),
      startBtn: document.getElementById("start-btn"),
      stopBtn: document.getElementById("stop-btn"),
      transcribeFullBtn: document.getElementById("full-transcribe-btn"),
      downloadBtn: document.getElementById("download-btn"),
      preview: document.getElementById("transcription-preview"),
      language: document.getElementById("language-select"),
      continuousMode: document.getElementById("continuous-mode"),
    };
  }

  attachEventListeners() {
    this.elements.startBtn.addEventListener("click", () =>
      this.startTranscription()
    );
    this.elements.stopBtn.addEventListener("click", () =>
      this.stopTranscription()
    );
    this.elements.transcribeFullBtn.addEventListener("click", () =>
      this.transcribeFullVideo()
    );
    this.elements.downloadBtn.addEventListener("click", () =>
      this.downloadTranscript()
    );

    // Settings change listeners
    this.elements.language.addEventListener("change", () =>
      this.saveSettings()
    );
    this.elements.continuousMode.addEventListener("change", () =>
      this.saveSettings()
    );

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message);
    });
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.sync.get({
        language: "en-US",
        continuousMode: true,
      });

      this.elements.language.value = settings.language;
      this.elements.continuousMode.checked = settings.continuousMode;
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  async saveSettings() {
    try {
      const settings = {
        language: this.elements.language.value,
        continuousMode: this.elements.continuousMode.checked,
      };

      await chrome.storage.sync.set(settings);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }

  async startTranscription() {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (
        !tab.url.includes("drive.google.com") &&
        !tab.url.includes("docs.google.com")
      ) {
        this.updateStatus(
          "Please navigate to a Google Drive video first",
          "error"
        );
        return;
      }

      // Get settings
      const settings = {
        language: this.elements.language.value,
        continuousMode: this.elements.continuousMode.checked,
      };

      // Send message to content script
      chrome.tabs.sendMessage(tab.id, {
        action: "START_TRANSCRIPTION",
        settings: settings,
      });

      this.isTranscribing = true;
      this.updateUI();
      this.updateStatus("Initializing transcription...", "transcribing");
    } catch (error) {
      console.error("Error starting transcription:", error);
      this.updateStatus("Failed to start transcription", "error");
    }
  }

  async stopTranscription() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      chrome.tabs.sendMessage(tab.id, {
        action: "STOP_TRANSCRIPTION",
      });

      this.isTranscribing = false;
      this.updateUI();
      this.updateStatus("Transcription stopped", "ready");
    } catch (error) {
      console.error("Error stopping transcription:", error);
    }
  }

  async transcribeFullVideo() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (
        !tab.url.includes("drive.google.com") &&
        !tab.url.includes("docs.google.com")
      ) {
        this.updateStatus(
          "Please navigate to a Google Drive video first",
          "error"
        );
        return;
      }

      // Get settings
      const settings = {
        language: this.elements.language.value,
        punctuation: this.elements.punctuation.checked,
        timestamps: this.elements.timestamps.checked,
        speakerLabels: this.elements.speakerLabels.checked,
        mode: "full",
      };

      // Send message to content script for full video transcription
      chrome.tabs.sendMessage(tab.id, {
        action: "TRANSCRIBE_FULL_VIDEO",
        settings: settings,
      });

      this.isTranscribing = true;
      this.updateUI();
      this.updateStatus("Extracting audio from video...", "transcribing");
      this.showProgress();
    } catch (error) {
      console.error("Error starting full video transcription:", error);
      this.updateStatus("Failed to start full video transcription", "error");
    }
  }

  handleMessage(message) {
    switch (message.action) {
      case "TRANSCRIPTION_STARTED":
        this.updateStatus("Transcription in progress...", "transcribing");
        this.showProgress();
        break;

      case "AUDIO_EXTRACTION_STARTED":
        this.updateStatus("Extracting audio from video...", "transcribing");
        this.updateProgress(25);
        break;

      case "AUDIO_EXTRACTION_PROGRESS":
        this.updateProgress(message.progress);
        break;

      case "AUDIO_EXTRACTION_COMPLETE":
        this.updateStatus(
          "Audio extracted, starting transcription...",
          "transcribing"
        );
        this.updateProgress(75);
        break;

      case "FULL_TRANSCRIPTION_PROGRESS":
        this.updateProgress(message.progress);
        this.updateTranscript(message.text);
        this.updateProgress(75 + (message.progress * 0.25));
        break;

      case "TRANSCRIPTION_PROGRESS":
        this.updateProgress(message.progress);
        this.updateTranscript(message.text);
        break;

      case "TRANSCRIPTION_COMPLETE":
        this.isTranscribing = false;
        this.updateUI();
        this.updateStatus("Transcription complete!", "ready");
        this.hideProgress();
        this.transcript = message.fullTranscript;
        break;

      case "TRANSCRIPTION_ERROR":
        this.isTranscribing = false;
        this.updateUI();
        this.updateStatus(`Error: ${message.error}`, "error");
        this.hideProgress();
        break;

      case "VIDEO_NOT_FOUND":
        this.updateStatus("No video found on this page", "error");
        break;

      case "AUDIO_EXTRACTION_ERROR":
        this.isTranscribing = false;
        this.updateUI();
        this.updateStatus(`Audio extraction failed: ${message.error}`, "error");
        this.hideProgress();
        break;
    }
  }

  updateUI() {
    // Update button states
    this.elements.startBtn.disabled = this.isTranscribing;
    this.elements.stopBtn.disabled = !this.isTranscribing;
    this.elements.transcribeFullBtn.disabled = this.isTranscribing;
    this.elements.downloadBtn.disabled = !this.transcript;
    this.elements.copyBtn.disabled = !this.transcript;

    // Update button styling based on disabled state
    if (this.isTranscribing) {
      this.elements.startBtn.className =
        "flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed";
      this.elements.stopBtn.className =
        "flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all";
      this.elements.transcribeFullBtn.className =
        "w-full bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed";
    } else {
      this.elements.startBtn.className =
        "flex-1 btn-gradient text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all";
      this.elements.stopBtn.className =
        "flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-500 transition-all";
      this.elements.transcribeFullBtn.className =
        "w-full btn-secondary text-white px-4 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all";
    }

    // Update download/copy buttons
    if (this.transcript) {
      this.elements.downloadBtn.className =
        "flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all";
      this.elements.copyBtn.className =
        "flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all";
    } else {
      this.elements.downloadBtn.className =
        "flex-1 bg-slate-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-600 transition-all";
      this.elements.copyBtn.className =
        "flex-1 bg-slate-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-600 transition-all";
    }
  }

  updateStatus(text, type = "ready") {
    const statusElement = this.elements.status;
    statusElement.innerHTML = "";

    // Create status indicator dot
    const dot = document.createElement("div");
    dot.className = "status-dot";

    // Create status text
    const textSpan = document.createElement("span");
    textSpan.textContent = text;

    // Update classes based on type
    switch (type) {
      case "ready":
        statusElement.className = "status-ready";
        dot.className += " ready";
        break;
      case "transcribing":
        statusElement.className = "status-transcribing";
        dot.className += " transcribing";
        break;
      case "error":
        statusElement.className = "status-error";
        dot.className += " error";
        break;
      default:
        statusElement.className = "status-ready";
        dot.className += " ready";
    }

    // Create container for dot and text
    const container = document.createElement("div");
    container.className = "flex items-center";
    container.appendChild(dot);
    container.appendChild(textSpan);
    statusElement.appendChild(container);
  }

  showProgress() {
    this.elements.progressContainer.classList.remove("hidden");
  }

  hideProgress() {
    this.elements.progressContainer.classList.add("hidden");
    this.elements.progressBar.style.width = "0%";
  }

  updateProgress(progress) {
    this.elements.progressBar.style.width = `${progress}%`;
    if (this.elements.progressText) {
      this.elements.progressText.textContent = `Processing... ${Math.round(progress)}%`;
    }
  }

  updateTranscript(text) {
    this.elements.preview.textContent = text;
    this.elements.preview.scrollTop = this.elements.preview.scrollHeight;
  }

  downloadTranscript() {
    if (!this.transcript) return;

    const blob = new Blob([this.transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TranscriptionPopup();
});
