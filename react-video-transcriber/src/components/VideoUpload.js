import React, { useState, useRef, useCallback } from "react";
import {
  CloudArrowUpIcon,
  LinkIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";
import {
  FiUpload,
  FiLoader,
  FiCheck,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { SiGoogledrive } from "react-icons/si";
import { useGoogleDrive } from "../contexts/GoogleDriveContext";
import "./VideoUpload.css";

const VideoUpload = ({ onVideoSelect, onError }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingLink, setIsProcessingLink] = useState(false);
  const [sharedLink, setSharedLink] = useState("");
  const [uploadMethod, setUploadMethod] = useState("file"); // 'file', 'drive', 'link'
  const [showInstructions, setShowInstructions] = useState(false);
  const fileInputRef = useRef(null);
  const {
    isSignedIn,
    signIn,
    signOut,
    isLoading,
    listVideos,
    accessSharedVideo,
  } = useGoogleDrive();

  const supportedFormats = [
    { ext: "MP4", desc: "Most common format" },
    { ext: "MOV", desc: "Apple QuickTime" },
    { ext: "AVI", desc: "Audio Video Interleave" },
    { ext: "MKV", desc: "Matroska Video" },
    { ext: "WebM", desc: "Web-optimized format" },
    { ext: "WMV", desc: "Windows Media" },
  ];

  const validateFile = (file) => {
    const maxSize = 500 * 1024 * 1024; // 500MB
    const allowedTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
      "video/webm",
      "video/x-ms-wmv",
    ];

    if (!allowedTypes.includes(file.type)) {
      onError(
        `Unsupported file type: ${file.type}. Please use MP4, MOV, AVI, MKV, WebM, or WMV.`
      );
      return false;
    }

    if (file.size > maxSize) {
      onError(
        "File size exceeds 500MB limit. Please compress your video or use a smaller file."
      );
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback(
    (files) => {
      if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
          setIsProcessing(true);
          setTimeout(() => {
            onVideoSelect({ ...file, source: "local" });
            setIsProcessing(false);
          }, 800);
        }
      }
    },
    [onVideoSelect, onError, validateFile]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      handleFileSelect(files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      handleFileSelect(files);
    },
    [handleFileSelect]
  );

  const handleGoogleDriveSelect = async () => {
    try {
      console.log('handleGoogleDriveSelect called');
      setIsProcessing(true);
      
      // Get list of videos from Google Drive
      console.log('Calling listVideos...');
      const videosData = await listVideos(20);
      console.log('Videos data received:', videosData);
      
      if (!videosData.files || videosData.files.length === 0) {
        throw new Error("No video files found in your Google Drive");
      }
      
      // For now, let's take the first video (we can add a picker UI later)
      const videoFile = videosData.files[0];
      console.log('Selected video file:', videoFile);
      
      if (!videoFile) {
        throw new Error("No video files available");
      }

      const mockFile = {
        name: videoFile.name,
        size: parseInt(videoFile.size) || 0,
        type: videoFile.mimeType,
        lastModified: new Date(videoFile.modifiedTime).getTime(),
        source: "google_drive",
        driveFileId: videoFile.id,
        downloadUrl: videoFile.downloadUrl,
        webViewLink: videoFile.webViewLink,
      };

      onVideoSelect(mockFile);
    } catch (error) {
      onError(error.message || "Failed to select video from Google Drive");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSharedLink = async () => {
    if (!sharedLink.trim()) {
      onError("Please enter a Google Drive share link");
      return;
    }

    setIsProcessingLink(true);
    try {
      const videoFile = await accessSharedVideo(sharedLink.trim());

      const mockFile = {
        name: videoFile.name,
        size: parseInt(videoFile.size) || 0,
        type: videoFile.mimeType,
        lastModified: new Date(videoFile.modifiedTime).getTime(),
        source: "google_drive_shared",
        driveFileId: videoFile.id,
        downloadUrl: videoFile.downloadUrl,
        webViewLink: videoFile.webViewLink,
      };

      onVideoSelect(mockFile);
    } catch (error) {
      onError(error.message || "Failed to access shared video");
    } finally {
      setIsProcessingLink(false);
    }
  };

  const UploadMethodSelector = () => (
    <div className="glass-card p-1 rounded-xl inline-flex mb-6">
      {[
        { id: "file", label: "Local File", icon: FiUpload },
        { id: "drive", label: "Google Drive", icon: SiGoogledrive },
        { id: "link", label: "Shared Link", icon: LinkIcon },
      ].map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setUploadMethod(id)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
            uploadMethod === id
              ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg"
              : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );

  const FileUploadArea = () => (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
        isDragOver
          ? "border-primary-400 bg-primary-50/50 scale-105"
          : "border-gray-300 hover:border-primary-300 hover:bg-gray-50/50"
      } ${isProcessing ? "pointer-events-none opacity-75" : ""}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="space-y-4">
        <div
          className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            isProcessing
              ? "bg-primary-100 animate-pulse"
              : isDragOver
              ? "bg-primary-100 scale-110"
              : "bg-gray-100"
          }`}
        >
          {isProcessing ? (
            <FiLoader className="w-8 h-8 text-primary-500 animate-spin" />
          ) : isDragOver ? (
            <FiCheck className="w-8 h-8 text-primary-500" />
          ) : (
            <CloudArrowUpIcon className="w-8 h-8 text-gray-400" />
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isProcessing
              ? "Processing video..."
              : isDragOver
              ? "Drop your video here"
              : "Upload your video"}
          </h3>
          <p className="text-gray-600">
            {isProcessing
              ? "Please wait while we prepare your video"
              : "Drag and drop your video file here, or click to browse"}
          </p>
        </div>
      </div>
    </div>
  );

  const GoogleDriveArea = () => (
    <div className="text-center space-y-6">
      {!isSignedIn ? (
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <SiGoogledrive className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Connect to Google Drive
            </h3>
            <p className="text-gray-600 mb-6">
              Sign in to access your videos stored in Google Drive
            </p>
            <button
              onClick={signIn}
              disabled={isLoading}
              className="btn-primary inline-flex items-center gap-2"
            >
              {isLoading ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <SiGoogledrive className="w-4 h-4" />
              )}
              {isLoading ? "Connecting..." : "Sign in with Google"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <FiCheck className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Google Drive Connected
            </h3>
            <p className="text-gray-600 mb-6">
              Select a video from your Google Drive
            </p>
            <div className="space-y-3">
              <button
                onClick={handleGoogleDriveSelect}
                disabled={isProcessing}
                className="btn-primary inline-flex items-center gap-2"
              >
                {isProcessing ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <PlayCircleIcon className="w-4 h-4" />
                )}
                {isProcessing ? "Loading..." : "Select Video"}
              </button>
              <br />
              <button
                onClick={signOut}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const SharedLinkArea = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
          <LinkIcon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Shared Google Drive Link
        </h3>
        <p className="text-gray-600">
          Enter a Google Drive share link to access the video
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="url"
            placeholder="https://drive.google.com/file/d/..."
            value={sharedLink}
            onChange={(e) => setSharedLink(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>

        <button
          onClick={handleSharedLink}
          disabled={!sharedLink.trim() || isProcessingLink}
          className="w-full btn-primary inline-flex items-center justify-center gap-2"
        >
          {isProcessingLink ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            <PlayCircleIcon className="w-4 h-4" />
          )}
          {isProcessingLink ? "Accessing video..." : "Access Video"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-4">
          Upload Your Video
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose your video source and get started with AI-powered
          transcription. We support multiple formats and sources for your
          convenience.
        </p>
      </div>

      {/* Upload Method Selector */}
      <div className="flex justify-center">
        <UploadMethodSelector />
      </div>

      {/* Main Upload Area */}
      <div className="glass-card rounded-2xl p-8">
        {uploadMethod === "file" && <FileUploadArea />}
        {uploadMethod === "drive" && <GoogleDriveArea />}
        {uploadMethod === "link" && <SharedLinkArea />}
      </div>

      {/* Supported Formats */}
      <div className="glass-card rounded-xl p-6">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            Supported Formats & Guidelines
          </h3>
          {showInstructions ? (
            <FiChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <FiChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {showInstructions && (
          <div className="mt-6 space-y-6">
            {/* Supported Formats */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Supported Video Formats
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {supportedFormats.map(({ ext, desc }) => (
                  <div
                    key={ext}
                    className="bg-white/50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="font-medium text-gray-900">{ext}</div>
                    <div className="text-sm text-gray-600">{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guidelines */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FiCheck className="w-4 h-4 text-green-500" />
                  Best Practices
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Use clear, high-quality audio</li>
                  <li>• Minimize background noise</li>
                  <li>• Ensure speakers are clearly audible</li>
                  <li>• Keep file size under 500MB</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FiAlertCircle className="w-4 h-4 text-orange-500" />
                  Important Notes
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Processing time varies by file size</li>
                  <li>• Google Drive files need proper permissions</li>
                  <li>• Shared links must be publicly accessible</li>
                  <li>• Your files are processed securely</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUpload;
