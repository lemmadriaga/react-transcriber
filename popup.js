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
      progressContainer: document.getElementById("progressContainer"),
      progressBar: document.getElementById("progressBar"),
      processingIndicator: document.getElementById("processingIndicator"),
      processingText: document.getElementById("processingText"),
      startBtn: document.getElementById("startTranscription"),
      stopBtn: document.getElementById("stopTranscription"),
      transcribeFullBtn: document.getElementById("transcribeFullVideo"),
      downloadBtn: document.getElementById("downloadTranscript"),
      copyBtn: document.getElementById("copyTranscript"),
      preview: document.getElementById("transcriptionPreview"),
      language: document.getElementById("language"),
      punctuation: document.getElementById("punctuation"),
      timestamps: document.getElementById("timestamps"),
      speakerLabels: document.getElementById("speakerLabels"),
      transcriptionMode: document.getElementById("transcriptionMode"),
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
    this.elements.copyBtn.addEventListener("click", () =>
      this.copyTranscript()
    );

    // Settings change listeners
    this.elements.language.addEventListener("change", () =>
      this.saveSettings()
    );
    this.elements.punctuation.addEventListener("change", () =>
      this.saveSettings()
    );
    this.elements.timestamps.addEventListener("change", () =>
      this.saveSettings()
    );
    this.elements.speakerLabels.addEventListener("change", () =>
      this.saveSettings()
    );
    this.elements.transcriptionMode.addEventListener("change", () => {
      this.updateModeUI();
      this.saveSettings();
    });

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message);
    });
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.sync.get({
        language: "en-US",
        punctuation: true,
        timestamps: true,
        speakerLabels: false,
        transcriptionMode: "live",
      });

      this.elements.language.value = settings.language;
      this.elements.punctuation.checked = settings.punctuation;
      this.elements.timestamps.checked = settings.timestamps;
      this.elements.speakerLabels.checked = settings.speakerLabels;
      this.elements.transcriptionMode.value = settings.transcriptionMode;
      this.updateModeUI();
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  async saveSettings() {
    try {
      const settings = {
        language: this.elements.language.value,
        punctuation: this.elements.punctuation.checked,
        timestamps: this.elements.timestamps.checked,
        speakerLabels: this.elements.speakerLabels.checked,
        transcriptionMode: this.elements.transcriptionMode.value,
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
        punctuation: this.elements.punctuation.checked,
        timestamps: this.elements.timestamps.checked,
        speakerLabels: this.elements.speakerLabels.checked,
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
      this.showProcessing("Analyzing video file...");
    } catch (error) {
      console.error("Error starting full video transcription:", error);
      this.updateStatus("Failed to start full video transcription", "error");
    }
  }

  updateModeUI() {
    const mode = this.elements.transcriptionMode.value;
    if (mode === "full") {
      this.elements.startBtn.textContent = "Start Live Transcription";
      this.elements.transcribeFullBtn.style.display = "block";
    } else {
      this.elements.startBtn.textContent = "Start Live Transcription";
      this.elements.transcribeFullBtn.style.display = "block";
    }
  }

  showProcessing(text = "Processing...") {
    this.elements.processingIndicator.style.display = "flex";
    this.elements.processingText.textContent = text;
  }

  hideProcessing() {
    this.elements.processingIndicator.style.display = "none";
  }

  showProgress() {
    this.elements.progressContainer.style.display = "block";
  }

  hideProgress() {
    this.elements.progressContainer.style.display = "none";
    this.elements.progressBar.style.width = "0%";
  }

  handleMessage(message) {
    switch (message.action) {
      case "TRANSCRIPTION_STARTED":
        this.updateStatus("Transcription in progress...", "transcribing");
        this.showProgress();
        break;

      case "AUDIO_EXTRACTION_STARTED":
        this.updateStatus("Extracting audio from video...", "transcribing");
        this.showProcessing("Extracting audio tracks...");
        break;

      case "AUDIO_EXTRACTION_PROGRESS":
        this.updateProgress(message.progress);
        this.showProcessing(
          `Processing audio: ${Math.round(message.progress)}%`
        );
        break;

      case "AUDIO_EXTRACTION_COMPLETE":
        this.updateStatus(
          "Audio extracted, starting transcription...",
          "transcribing"
        );
        this.showProcessing("Starting speech recognition...");
        break;

      case "FULL_TRANSCRIPTION_PROGRESS":
        this.updateProgress(message.progress);
        this.updateTranscript(message.text);
        this.showProcessing(`Transcribing: ${Math.round(message.progress)}%`);
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
        this.hideProcessing();
        this.transcript = message.fullTranscript;
        break;

      case "TRANSCRIPTION_ERROR":
        this.isTranscribing = false;
        this.updateUI();
        this.updateStatus(`Error: ${message.error}`, "error");
        this.hideProgress();
        this.hideProcessing();
        break;

      case "VIDEO_NOT_FOUND":
        this.updateStatus("No video found on this page", "error");
        this.hideProcessing();
        break;

      case "AUDIO_EXTRACTION_ERROR":
        this.isTranscribing = false;
        this.updateUI();
        this.updateStatus(`Audio extraction failed: ${message.error}`, "error");
        this.hideProcessing();
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
    dot.className = "w-2 h-2 rounded-full";

    // Create status text
    const textSpan = document.createElement("span");
    textSpan.textContent = text;
    textSpan.className = "text-sm font-medium";

    // Update classes based on type
    switch (type) {
      case "ready":
        statusElement.className =
          "flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium";
        dot.className += " bg-green-500 status-indicator";
        break;
      case "transcribing":
        statusElement.className =
          "flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium";
        dot.className += " bg-blue-500 status-indicator";
        break;
      case "error":
        statusElement.className =
          "flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium";
        dot.className += " bg-red-500";
        break;
    }

    statusElement.appendChild(dot);
    statusElement.appendChild(textSpan);
  }

  showProgress() {
    this.elements.progressContainer.style.display = "block";
  }

  hideProgress() {
    this.elements.progressContainer.style.display = "none";
    this.elements.progressBar.style.width = "0%";
  }

  updateProgress(progress) {
    this.elements.progressBar.style.width = `${progress}%`;
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

  async copyTranscript() {
    if (!this.transcript) return;

    try {
      await navigator.clipboard.writeText(this.transcript);
      this.updateStatus("Transcript copied to clipboard!", "ready");
      setTimeout(() => this.updateStatus("Ready to transcribe", "ready"), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      this.updateStatus("Failed to copy transcript", "error");
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TranscriptionPopup();
});
