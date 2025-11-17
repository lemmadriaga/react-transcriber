import React, { useRef, useEffect, useState } from "react";
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  FilmIcon,
} from "@heroicons/react/24/outline";
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiClock,
  FiHardDrive,
  FiFile,
} from "react-icons/fi";

const VideoPreview = ({ videoFile, onError }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoFile) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [videoFile]);

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((error) => {
        console.error("Error playing video:", error);
        onError &&
          onError("Failed to play video. Please check the file format.");
      });
    }
  };

  if (!videoFile) {
    return null;
  }

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <FilmIcon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-2xl font-heading font-bold text-white">
          Video Preview
        </h3>
      </div>

      <div className="relative bg-black/30 rounded-xl overflow-hidden border border-white/10">
        <video
          ref={videoRef}
          src={videoFile.url}
          className="w-full h-64 sm:h-80 lg:h-96 object-contain"
          preload="metadata"
        />

        {/* Custom Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
                onClick={togglePlayPause}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <FiPause className="w-6 h-6 text-white" />
                ) : (
                  <FiPlay className="w-6 h-6 text-white" />
                )}
              </button>

              <div className="text-white text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-white/80">
              <FiVolume2 className="w-5 h-5" />
              <span className="text-sm">Audio enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center space-x-2 text-blue-400">
            <FiFile className="w-4 h-4" />
            <span className="text-sm font-medium">File Name</span>
          </div>
          <div
            className="text-white font-semibold truncate"
            title={videoFile.name}
          >
            {videoFile.name}
          </div>
        </div>

        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center space-x-2 text-green-400">
            <FiClock className="w-4 h-4" />
            <span className="text-sm font-medium">Duration</span>
          </div>
          <div className="text-white font-semibold">
            {duration > 0 ? formatTime(duration) : "Loading..."}
          </div>
        </div>

        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center space-x-2 text-purple-400">
            <FiHardDrive className="w-4 h-4" />
            <span className="text-sm font-medium">File Size</span>
          </div>
          <div className="text-white font-semibold">
            {formatFileSize(videoFile.size)}
          </div>
        </div>

        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center space-x-2 text-yellow-400">
            <FilmIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Format</span>
          </div>
          <div className="text-white font-semibold">
            {videoFile.type.split("/")[1]?.toUpperCase() || "Unknown"}
          </div>
        </div>
      </div>

      {/* Source Information */}
      {videoFile.source && (
        <div className="glass-card p-4 border-l-4 border-blue-500">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-white/80 font-medium">
              Source:{" "}
              {videoFile.source === "local"
                ? "Local File"
                : videoFile.source === "google_drive"
                ? "Google Drive"
                : videoFile.source === "google_drive_shared"
                ? "Shared Google Drive"
                : "Unknown"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPreview;
