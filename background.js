// Background service worker for Video Transcriber Pro
chrome.runtime.onInstalled.addListener(() => {
  console.log("Video Transcriber Pro installed");

  // Set default settings
  chrome.storage.sync.set({
    language: "en-US",
    punctuation: true,
    timestamps: true,
    speakerLabels: false,
    transcriptionMode: "live",
  });
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "TRANSCRIPTION_UPDATE":
      // Forward transcription updates to popup
      forwardToPopup(message);
      break;

    case "GET_SETTINGS":
      // Return current settings
      chrome.storage.sync
        .get({
          language: "en-US",
          punctuation: true,
          timestamps: true,
          speakerLabels: false,
          transcriptionMode: "live",
        })
        .then((settings) => {
          sendResponse(settings);
        });
      return true; // Keep message channel open for async response

    case "SAVE_TRANSCRIPT":
      // Save transcript to storage
      saveTranscript(message.transcript, message.metadata);
      break;
  }
});

// Forward messages to popup if it's open
function forwardToPopup(message) {
  chrome.runtime.sendMessage(message).catch(() => {
    // Popup is not open, ignore error
  });
}

// Save transcript with metadata
async function saveTranscript(transcript, metadata) {
  try {
    const timestamp = Date.now();
    const transcriptData = {
      transcript,
      metadata,
      timestamp,
      id: `transcript_${timestamp}`,
    };

    // Store in local storage for persistence
    await chrome.storage.local.set({
      [`transcript_${timestamp}`]: transcriptData,
    });

    console.log("Transcript saved:", transcriptData.id);
  } catch (error) {
    console.error("Error saving transcript:", error);
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open popup (this is handled automatically by manifest)
});

// Monitor tab changes to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    (tab.url?.includes("drive.google.com") ||
      tab.url?.includes("docs.google.com"))
  ) {
    // Ensure content script is injected
    chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        files: ["content.js"],
      })
      .catch((error) => {
        // Script might already be injected
        console.log("Content script injection:", error.message);
      });
  }
});
