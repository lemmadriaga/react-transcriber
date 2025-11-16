// Content script for Video Transcriber Pro
class VideoTranscriber {
  constructor() {
    this.videoElement = null;
    this.recognition = null;
    this.isTranscribing = false;
    this.transcript = "";
    this.settings = null;
    this.overlay = null;
    this.audioContext = null;
    this.audioBuffer = null;
    this.isProcessingFullVideo = false;

    this.init();
  }

  async init() {
    console.log("Video Transcriber Pro: Content script loaded");

    // Check if Web Speech API is available
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      console.error("Web Speech API not supported");
      return;
    }

    // Find video element
    this.findVideoElement();

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
    });

    // Create floating overlay
    this.createOverlay();

    // Monitor for new video elements (for dynamic content)
    this.observePageChanges();
  }

  findVideoElement() {
    // Look for video elements in Google Drive with improved selectors
    const videoSelectors = [
      "video",
      "video[src]",
      "video[data-src]",
      ".video-stream",
      "[data-video]",
      'iframe[src*="drive.google.com"]',
      'video[preload]',
      '.html5-video-player video',
      '[role="application"] video',
    ];

    for (const selector of videoSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        this.videoElement = element;
        console.log("Video element found:", element);
        return;
      }
    }

    // If no direct video, look for iframe containing video
    const iframes = document.querySelectorAll("iframe");
    for (const iframe of iframes) {
      try {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const video = iframeDoc.querySelector("video");
          if (video) {
            this.videoElement = video;
            console.log("Video found in iframe:", video);
            return;
          }
        }
      } catch (e) {
        // Cross-origin iframe, can't access
        console.log("Cross-origin iframe detected");
      }
    }
  }

  observePageChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const video = node.querySelector
                ? node.querySelector("video")
                : null;
              if (video || node.tagName === "VIDEO") {
                this.videoElement = video || node;
                console.log("New video element detected:", this.videoElement);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  createOverlay() {
    this.overlay = document.createElement("div");
    this.overlay.id = "transcription-overlay";
    this.overlay.innerHTML = `
      <div class="transcription-panel">
        <div class="transcription-header">
          <h3>🎙️ Live Transcription</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="transcription-content">
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span class="status-text">Ready</span>
          </div>
          <div class="transcription-text" id="live-transcript">
            Transcription will appear here...
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    // Add event listeners
    this.overlay.querySelector(".close-btn").addEventListener("click", () => {
      this.overlay.style.display = "none";
    });

    // Make draggable
    this.makeOverlayDraggable();
  }

  makeOverlayDraggable() {
    const header = this.overlay.querySelector(".transcription-header");
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    header.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = this.overlay.offsetLeft;
      startTop = this.overlay.offsetTop;

      header.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      this.overlay.style.left = `${startLeft + deltaX}px`;
      this.overlay.style.top = `${startTop + deltaY}px`;
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      header.style.cursor = "grab";
    });
  }

  async handleMessage(message, sendResponse) {
    switch (message.action) {
      case "START_TRANSCRIPTION":
        await this.startTranscription(message.settings);
        break;

      case "STOP_TRANSCRIPTION":
        this.stopTranscription();
        break;

      case "TRANSCRIBE_FULL_VIDEO":
        await this.transcribeFullVideo(message.settings);
        break;
    }
  }

  async startTranscription(settings) {
    this.settings = settings;

    if (!this.videoElement) {
      this.findVideoElement();
      if (!this.videoElement) {
        chrome.runtime.sendMessage({ action: "VIDEO_NOT_FOUND" });
        return;
      }
    }

    try {
      // Initialize speech recognition
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();

      // Configure recognition for better accuracy
      this.recognition.continuous = settings.continuousMode || true;
      this.recognition.interimResults = true;
      this.recognition.lang = settings.language || 'en-US';
      this.recognition.maxAlternatives = 3;
      this.recognition.serviceURI = null; // Use default service for better accuracy

      // Set up event listeners
      this.recognition.onstart = () => {
        this.isTranscribing = true;
        this.updateOverlayStatus("Recording...", "recording");
        chrome.runtime.sendMessage({ action: "TRANSCRIPTION_STARTED" });
      };

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          // Use confidence score to improve accuracy
          const confidence = result[0].confidence || 0;
          
          if (result.isFinal) {
            // Only add transcripts with reasonable confidence
            if (confidence > 0.3 || !confidence) {
              finalTranscript += transcript + " ";
            }
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          const cleanedTranscript = this.cleanTranscript(finalTranscript);
          this.transcript += this.formatTranscript(cleanedTranscript, settings);
          this.updateOverlayTranscript(this.transcript);

          chrome.runtime.sendMessage({
            action: "TRANSCRIPTION_PROGRESS",
            text: this.transcript,
            progress: this.calculateProgress(),
          });
        }

        // Show interim results
        if (interimTranscript) {
          this.updateOverlayTranscript(this.transcript + interimTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        chrome.runtime.sendMessage({
          action: "TRANSCRIPTION_ERROR",
          error: event.error,
        });
        this.updateOverlayStatus("Error occurred", "error");
      };

      recognition.onend = () => {
        if (this.isTranscribing) {
          // Restart recognition if still transcribing
          setTimeout(() => {
            if (this.isTranscribing) {
              recognition.start();
            }
          }, 100);
        }
      };

      // Store recognition instance
      this.recognition = recognition;

      // Show overlay
      this.overlay.style.display = "flex";
      this.updateOverlayStatus("Starting...", "starting");

      // Start recognition
      recognition.start();
    } catch (error) {
      console.error("Error starting transcription:", error);
      chrome.runtime.sendMessage({
        action: "TRANSCRIPTION_ERROR",
        error: error.message,
      });
    }
  }

  stopTranscription() {
    this.isTranscribing = false;

    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }

    this.updateOverlayStatus("Stopped", "stopped");

    chrome.runtime.sendMessage({
      action: "TRANSCRIPTION_COMPLETE",
      fullTranscript: this.transcript,
    });

    // Save transcript
    chrome.runtime.sendMessage({
      action: "SAVE_TRANSCRIPT",
      transcript: this.transcript,
      metadata: {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        settings: this.settings,
      },
    });
  }

  formatTranscript(text, settings) {
    let formatted = text.trim();

    // Add timestamp if enabled
    if (settings.timestamps) {
      const timestamp = new Date().toLocaleTimeString();
      formatted = `[${timestamp}] ${formatted}`;
    }

    // Add punctuation if enabled
    if (settings.punctuation) {
      // Simple punctuation rules
      formatted = formatted.replace(/\s+/g, " ");
      if (!formatted.match(/[.!?]$/)) {
        formatted += ".";
      }
    }

    return formatted + "\n";
  }

  calculateProgress() {
    // Simple progress calculation based on video duration if available
    if (
      this.videoElement &&
      this.videoElement.duration &&
      this.videoElement.currentTime
    ) {
      return (this.videoElement.currentTime / this.videoElement.duration) * 100;
    }
    return 0;
  }

  updateOverlayStatus(text, status) {
    const statusText = this.overlay.querySelector(".status-text");
    const statusDot = this.overlay.querySelector(".status-dot");

    statusText.textContent = text;
    statusDot.className = `status-dot ${status}`;
  }

  updateOverlayTranscript(text) {
    const transcriptDiv = this.overlay.querySelector("#live-transcript");
    transcriptDiv.textContent = text;
    transcriptDiv.scrollTop = transcriptDiv.scrollHeight;
  }

  async transcribeFullVideo(settings) {
    this.settings = settings;
    this.isProcessingFullVideo = true;

    if (!this.videoElement) {
      this.findVideoElement();
      if (!this.videoElement) {
        chrome.runtime.sendMessage({ action: "VIDEO_NOT_FOUND" });
        return;
      }
    }

    try {
      chrome.runtime.sendMessage({ action: "AUDIO_EXTRACTION_STARTED" });

      // Try real-time transcription method first (more reliable for Google Drive)
      await this.transcribeVideoRealTime(settings);
      
    } catch (error) {
      console.error("Error in full video transcription:", error);
      chrome.runtime.sendMessage({
        action: "AUDIO_EXTRACTION_ERROR",
        error: error.message,
      });
    } finally {
      this.isProcessingFullVideo = false;
      if (this.audioContext) {
        this.audioContext.close();
      }
    }
  }

  async transcribeVideoRealTime(settings) {
    try {
      // Use real-time transcription but play video automatically
      const originalCurrentTime = this.videoElement.currentTime;
      const duration = this.videoElement.duration;
      
      if (!duration || duration === 0) {
        throw new Error("Video duration not available");
      }

      // Initialize speech recognition for continuous transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = settings.language || 'en-US';
      recognition.maxAlternatives = 1;
      
      this.transcript = "";
      let isTranscribing = true;
      let currentSegment = "";
      
      chrome.runtime.sendMessage({ 
        action: "AUDIO_EXTRACTION_COMPLETE" 
      });

      return new Promise((resolve, reject) => {
        recognition.onresult = (event) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              const transcript = event.results[i][0].transcript.trim();
              if (transcript) {
                const timestamp = this.formatTimestamp(this.videoElement.currentTime);
                const formattedTranscript = settings.timestamps ? 
                  `[${timestamp}] ${transcript}` : transcript;
                
                this.transcript += formattedTranscript + "\n";
                
                chrome.runtime.sendMessage({
                  action: "FULL_TRANSCRIPTION_PROGRESS",
                  text: this.transcript,
                  progress: (this.videoElement.currentTime / duration) * 100,
                });
              }
            }
          }
        };

        recognition.onerror = (event) => {
          console.error("Real-time transcription error:", event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            reject(new Error('Microphone permission required for transcription'));
          }
        };

        recognition.onend = () => {
          if (isTranscribing && this.videoElement.currentTime < duration - 1) {
            // Restart recognition if video is still playing
            setTimeout(() => recognition.start(), 100);
          } else {
            // Transcription complete
            chrome.runtime.sendMessage({
              action: "TRANSCRIPTION_COMPLETE",
              fullTranscript: this.transcript,
            });
            resolve();
          }
        };

        // Set up video event listeners
        const onVideoEnd = () => {
          isTranscribing = false;
          recognition.stop();
          this.videoElement.currentTime = originalCurrentTime;
          
          chrome.runtime.sendMessage({
            action: "TRANSCRIPTION_COMPLETE",
            fullTranscript: this.transcript,
          });
          resolve();
        };

        this.videoElement.addEventListener('ended', onVideoEnd, { once: true });
        
        // Start transcription and play video
        this.videoElement.currentTime = 0;
        recognition.start();
        
        this.videoElement.play().catch(error => {
          console.error('Error playing video:', error);
          reject(new Error('Cannot play video for transcription'));
        });
      });
      
    } catch (error) {
      console.error('Real-time transcription setup failed:', error);
      throw error;
    }
  }

  async extractAudioFromVideo() {
    try {
      // Use MediaElementAudioSourceNode for better compatibility with protected content
      if (!this.videoElement.duration || this.videoElement.duration === 0) {
        throw new Error("Video not loaded or has no duration");
      }

      // Create audio source from video element directly
      const audioSource = this.audioContext.createMediaElementSource(this.videoElement);
      const analyser = this.audioContext.createAnalyser();
      const scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      audioSource.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(this.audioContext.destination);

      // Alternative approach: Use Web Audio API with video element
      return await this.extractAudioUsingWebAudioAPI();

      chrome.runtime.sendMessage({
        action: "AUDIO_EXTRACTION_PROGRESS",
        progress: 25,
      });

      return audioSource;
    } catch (error) {
      console.error("Direct audio extraction failed, trying alternative method:", error);
      return await this.extractAudioUsingMediaRecorder();
    }
  }

  async extractAudioUsingWebAudioAPI() {
    try {
      // Ensure video is playing for audio extraction
      if (this.videoElement.paused) {
        await this.videoElement.play();
      }

      const duration = this.videoElement.duration;
      const sampleRate = this.audioContext.sampleRate;
      const audioBuffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
      
      chrome.runtime.sendMessage({
        action: "AUDIO_EXTRACTION_PROGRESS",
        progress: 100,
      });

      return audioBuffer;
    } catch (error) {
      console.error("Web Audio API extraction failed:", error);
      throw error;
    }
  }

  async extractAudioUsingMediaRecorder() {
    try {
      // Use MediaRecorder API as fallback for protected content
      const stream = this.videoElement.captureStream ? this.videoElement.captureStream() : null;
      
      if (!stream) {
        throw new Error("Cannot capture stream from video element");
      }

      // Get audio tracks only
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error("No audio tracks found in video");
      }

      const audioStream = new MediaStream(audioTracks);
      
      chrome.runtime.sendMessage({
        action: "AUDIO_EXTRACTION_PROGRESS",
        progress: 100,
      });

      return audioStream;
    } catch (error) {
      console.error("Audio extraction error:", error);

      // Fallback: try to capture audio from the playing video
      return await this.captureAudioFromPlayingVideo();
    }
  }

  async captureAudioFromPlayingVideo() {
    try {
      // Create a MediaElementAudioSourceNode from the video element
      const source = this.audioContext.createMediaElementSource(
        this.videoElement
      );
      const analyser = this.audioContext.createAnalyser();
      const scriptProcessor = this.audioContext.createScriptProcessor(
        4096,
        1,
        1
      );

      source.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(this.audioContext.destination);

      // Store audio data
      const audioChunks = [];
      const sampleRate = this.audioContext.sampleRate;
      const duration = this.videoElement.duration || 60; // Default to 60 seconds if duration unknown

      return new Promise((resolve, reject) => {
        let startTime = Date.now();

        scriptProcessor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          audioChunks.push(new Float32Array(inputData));

          // Calculate progress
          const elapsed = (Date.now() - startTime) / 1000;
          const progress = Math.min((elapsed / duration) * 100, 100);

          chrome.runtime.sendMessage({
            action: "AUDIO_EXTRACTION_PROGRESS",
            progress: progress,
          });

          // Stop when we've captured enough or reached end
          if (elapsed >= duration || this.videoElement.ended) {
            scriptProcessor.disconnect();

            // Combine audio chunks
            const totalLength = audioChunks.reduce(
              (sum, chunk) => sum + chunk.length,
              0
            );
            const combinedAudio = new Float32Array(totalLength);
            let offset = 0;

            for (const chunk of audioChunks) {
              combinedAudio.set(chunk, offset);
              offset += chunk.length;
            }

            // Create audio buffer
            const audioBuffer = this.audioContext.createBuffer(
              1,
              combinedAudio.length,
              sampleRate
            );
            audioBuffer.copyToChannel(combinedAudio, 0);

            resolve(audioBuffer);
          }
        };

        // Start the video to capture audio
        if (this.videoElement.paused) {
          this.videoElement.play().catch(reject);
        }

        // Timeout after reasonable duration
        setTimeout(() => {
          scriptProcessor.disconnect();
          reject(new Error("Audio capture timeout"));
        }, (duration + 10) * 1000);
      });
    } catch (error) {
      throw new Error(`Audio capture failed: ${error.message}`);
    }
  }

  async processAudioForTranscription(audioBuffer, settings) {
    try {
      // Convert audio buffer to chunks for processing
      const chunkDuration = 30; // seconds per chunk
      const sampleRate = audioBuffer.sampleRate;
      const samplesPerChunk = chunkDuration * sampleRate;
      const totalSamples = audioBuffer.length;
      const numChunks = Math.ceil(totalSamples / samplesPerChunk);

      this.transcript = "";

      for (let i = 0; i < numChunks; i++) {
        const startSample = i * samplesPerChunk;
        const endSample = Math.min(startSample + samplesPerChunk, totalSamples);

        // Extract chunk
        const chunkBuffer = this.audioContext.createBuffer(
          1,
          endSample - startSample,
          sampleRate
        );

        const sourceData = audioBuffer.getChannelData(0);
        const chunkData = chunkBuffer.getChannelData(0);

        for (let j = 0; j < chunkData.length; j++) {
          chunkData[j] = sourceData[startSample + j];
        }

        // Convert to audio for speech recognition
        const chunkText = await this.transcribeAudioChunk(
          chunkBuffer,
          settings,
          i
        );

        if (chunkText) {
          const timestamp = this.formatTimestamp(i * chunkDuration);
          let formattedChunk = chunkText;

          if (settings.timestamps) {
            formattedChunk = `[${timestamp}] ${chunkText}`;
          }

          this.transcript += formattedChunk + "\n";

          chrome.runtime.sendMessage({
            action: "FULL_TRANSCRIPTION_PROGRESS",
            text: this.transcript,
            progress: ((i + 1) / numChunks) * 100,
          });
        }
      }

      chrome.runtime.sendMessage({
        action: "TRANSCRIPTION_COMPLETE",
        fullTranscript: this.transcript,
      });

      // Save transcript
      chrome.runtime.sendMessage({
        action: "SAVE_TRANSCRIPT",
        transcript: this.transcript,
        metadata: {
          url: window.location.href,
          timestamp: new Date().toISOString(),
          settings: settings,
          method: "full_video",
        },
      });
    } catch (error) {
      console.error("Error processing audio for transcription:", error);
      chrome.runtime.sendMessage({
        action: "TRANSCRIPTION_ERROR",
        error: error.message,
      });
    }
  }

  async transcribeAudioChunk(audioBuffer, settings, chunkIndex) {
    return new Promise((resolve) => {
      try {
        // Convert AudioBuffer to playable audio for speech recognition
        const offlineContext = new OfflineAudioContext(
          1,
          audioBuffer.length,
          audioBuffer.sampleRate
        );
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);

        // Use Web Speech API with a temporary audio element
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = settings.language;
        recognition.continuous = false;
        recognition.interimResults = false;

        let transcriptionResult = "";
        let timeoutId;

        recognition.onresult = (event) => {
          if (event.results.length > 0) {
            transcriptionResult = event.results[0][0].transcript;
            if (settings.punctuation && !transcriptionResult.match(/[.!?]$/)) {
              transcriptionResult += ".";
            }
          }
          clearTimeout(timeoutId);
          resolve(transcriptionResult);
        };

        recognition.onerror = (event) => {
          console.error(
            `Speech recognition error for chunk ${chunkIndex}:`,
            event.error
          );
          clearTimeout(timeoutId);
          resolve(""); // Return empty string on error, don't fail entire process
        };

        recognition.onend = () => {
          clearTimeout(timeoutId);
          resolve(transcriptionResult);
        };

        // Create a temporary audio element to play the chunk
        const tempAudio = document.createElement("audio");
        tempAudio.style.display = "none";
        document.body.appendChild(tempAudio);

        // Convert AudioBuffer to blob and play
        this.audioBufferToBlob(audioBuffer).then((blob) => {
          const url = URL.createObjectURL(blob);
          tempAudio.src = url;
          tempAudio.volume = 0.01; // Very low volume

          tempAudio.oncanplay = () => {
            recognition.start();
            tempAudio.play().catch(console.error);
          };

          tempAudio.onended = () => {
            setTimeout(() => {
              document.body.removeChild(tempAudio);
              URL.revokeObjectURL(url);
            }, 100);
          };
        });

        // Timeout after 45 seconds
        timeoutId = setTimeout(() => {
          recognition.stop();
          resolve(transcriptionResult || "");
        }, 45000);
      } catch (error) {
        console.error(`Error transcribing chunk ${chunkIndex}:`, error);
        resolve("");
      }
    });
  }

  audioBufferToBlob(audioBuffer) {
    return new Promise((resolve) => {
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start(0);

      offlineContext.startRendering().then((renderedBuffer) => {
        const wav = this.audioBufferToWav(renderedBuffer);
        const blob = new Blob([wav], { type: "audio/wav" });
        resolve(blob);
      });
    });
  }

  audioBufferToWav(buffer) {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, length * numberOfChannels * 2, true);

    // Convert float audio data to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(
          -1,
          Math.min(1, buffer.getChannelData(channel)[i])
        );
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true
        );
        offset += 2;
      }
    }

    return arrayBuffer;
  }

  formatTimestamp(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    } else {
      return `${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
  }

  cleanTranscript(text) {
    // Remove excessive spaces and clean up text
    return text
      .replace(/\s+/g, ' ')
      .replace(/\s([.!?])/g, '$1')
      .replace(/([.!?])\s*([a-z])/g, '$1 $2')
      .trim();
  }

  formatTranscript(text, settings) {
    let formatted = this.cleanTranscript(text);
    
    // Add punctuation if enabled and missing
    if (settings && settings.punctuation && !formatted.match(/[.!?]$/)) {
      formatted += ".";
    }
    
    // Capitalize first letter of sentences
    formatted = formatted.replace(/(^|[.!?]\s+)([a-z])/g, (match, p1, p2) => {
      return p1 + p2.toUpperCase();
    });
    
    return formatted + " ";
  }

  formatTimestamp(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  calculateProgress() {
    if (!this.videoElement || !this.videoElement.duration) {
      return 0;
    }
    return Math.round((this.videoElement.currentTime / this.videoElement.duration) * 100);
  }
}

// Initialize transcriber when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new VideoTranscriber();
  });
} else {
  new VideoTranscriber();
}
