import React, { useState, useCallback } from "react";
import Header from "./components/Header";
import VideoUpload from "./components/VideoUpload";
import VideoPreview from "./components/VideoPreview";
import TranscriptionSettings from "./components/TranscriptionSettings";
import TranscriptionProgress from "./components/TranscriptionProgress";
import TranscriptionResults from "./components/TranscriptionResults";
import ErrorDisplay from "./components/ErrorDisplay";
import { GoogleDriveProvider } from "./contexts/GoogleDriveContext";
import { TranscriptionProvider } from "./contexts/TranscriptionContext";

function App() {
  const [currentStep, setCurrentStep] = useState("upload"); // upload, preview, transcribe, results
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState(null);

  const handleVideoSelected = useCallback((file) => {
    setVideoFile(file);
    setCurrentStep("preview");
    setError(null);
  }, []);

  const handleTranscriptionStart = useCallback(() => {
    setCurrentStep("transcribe");
    setError(null);
  }, []);

  const handleTranscriptionComplete = useCallback((result) => {
    setCurrentStep("results");
    setError(null);
  }, []);

  const handleError = useCallback((errorMessage) => {
    setError(errorMessage);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    if (videoFile) {
      setCurrentStep("preview");
    } else {
      setCurrentStep("upload");
    }
  }, [videoFile]);

  const handleStartOver = useCallback(() => {
    setVideoFile(null);
    setCurrentStep("upload");
    setError(null);
  }, []);

  return (
    <GoogleDriveProvider>
      <TranscriptionProvider>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
          <Header />

          <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              {error && (
                <div className="mb-8 animate-slide-down">
                  <ErrorDisplay
                    message={error}
                    onRetry={handleRetry}
                    onStartOver={handleStartOver}
                  />
                </div>
              )}

              {!error && (
                <>
                  {currentStep === "upload" && (
                    <div className="animate-fade-in">
                      <VideoUpload
                        onVideoSelected={handleVideoSelected}
                        onError={handleError}
                      />
                    </div>
                  )}

                  {currentStep === "preview" && videoFile && (
                    <div className="space-y-8 animate-slide-up">
                      <VideoPreview
                        videoFile={videoFile}
                        onError={handleError}
                      />
                      <TranscriptionSettings
                        videoFile={videoFile}
                        onTranscriptionStart={handleTranscriptionStart}
                        onError={handleError}
                      />
                    </div>
                  )}

                  {currentStep === "transcribe" && (
                    <div className="animate-scale-in">
                      <TranscriptionProgress
                        videoFile={videoFile}
                        onComplete={handleTranscriptionComplete}
                        onError={handleError}
                      />
                    </div>
                  )}

                  {currentStep === "results" && (
                    <div className="animate-fade-in">
                      <TranscriptionResults
                        videoFile={videoFile}
                        onStartOver={handleStartOver}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Progress Indicator */}
              {!error && (
                <div className="fixed top-1/2 right-8 transform -translate-y-1/2 z-50 hidden lg:flex flex-col space-y-6">
                  <div
                    className={`flex flex-col items-center transition-all duration-300 ${
                      currentStep === "upload"
                        ? "scale-110 opacity-100"
                        : currentStep !== "upload"
                        ? "opacity-75"
                        : "opacity-40"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        currentStep === "upload"
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-glow"
                          : currentStep !== "upload"
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : "bg-white/20 border border-white/30"
                      }`}
                    >
                      {currentStep !== "upload" ? "✓" : "1"}
                    </div>
                    <span className="text-xs mt-2 text-white/80 font-medium">
                      Upload
                    </span>
                  </div>
                  <div
                    className={`flex flex-col items-center transition-all duration-300 ${
                      currentStep === "preview"
                        ? "scale-110 opacity-100"
                        : ["transcribe", "results"].includes(currentStep)
                        ? "opacity-75"
                        : "opacity-40"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        currentStep === "preview"
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-glow"
                          : ["transcribe", "results"].includes(currentStep)
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : "bg-white/20 border border-white/30"
                      }`}
                    >
                      {["transcribe", "results"].includes(currentStep)
                        ? "✓"
                        : "2"}
                    </div>
                    <span className="text-xs mt-2 text-white/80 font-medium">
                      Configure
                    </span>
                  </div>
                  <div
                    className={`flex flex-col items-center transition-all duration-300 ${
                      currentStep === "transcribe"
                        ? "scale-110 opacity-100"
                        : currentStep === "results"
                        ? "opacity-75"
                        : "opacity-40"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        currentStep === "transcribe"
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-glow"
                          : currentStep === "results"
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : "bg-white/20 border border-white/30"
                      }`}
                    >
                      {currentStep === "results" ? "✓" : "3"}
                    </div>
                    <span className="text-xs mt-2 text-white/80 font-medium">
                      Transcribe
                    </span>
                  </div>
                  <div
                    className={`flex flex-col items-center transition-all duration-300 ${
                      currentStep === "results"
                        ? "scale-110 opacity-100"
                        : "opacity-40"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        currentStep === "results"
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-glow"
                          : "bg-white/20 border border-white/30"
                      }`}
                    >
                      4
                    </div>
                    <span className="text-xs mt-2 text-white/80 font-medium">
                      Results
                    </span>
                  </div>
                </div>
              )}
            </div>
          </main>

          <footer className="mt-auto bg-black/20 backdrop-blur-sm border-t border-white/10">
            <div className="max-w-6xl mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-center md:text-left">
                  <p className="text-white/80 font-medium">
                    &copy; 2025 Video Transcriber Pro. Built with React.js
                  </p>
                  <p className="text-white/60 text-sm mt-1">
                    Secure • Private • AI-Powered
                  </p>
                </div>
                <div className="flex space-x-6">
                  <a
                    href="#privacy"
                    className="text-white/70 hover:text-white transition-colors duration-300 text-sm font-medium hover:underline"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#terms"
                    className="text-white/70 hover:text-white transition-colors duration-300 text-sm font-medium hover:underline"
                  >
                    Terms of Service
                  </a>
                  <a
                    href="#support"
                    className="text-white/70 hover:text-white transition-colors duration-300 text-sm font-medium hover:underline"
                  >
                    Support
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </TranscriptionProvider>
    </GoogleDriveProvider>
  );
}

export default App;
