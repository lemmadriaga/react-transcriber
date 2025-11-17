import React, { useEffect } from "react";
import { FiMic, FiCpu, FiFileText, FiLoader } from "react-icons/fi";
import { useTranscription } from "../contexts/TranscriptionContext";

const TranscriptionProgress = ({ videoFile, onComplete, onError }) => {
  const { progress, status, transcriptionResult, isTranscribing } =
    useTranscription();

  useEffect(() => {
    if (!isTranscribing && transcriptionResult && progress === 100) {
      onComplete && onComplete(transcriptionResult);
    }
  }, [isTranscribing, transcriptionResult, progress, onComplete]);

  const getProgressIcon = () => {
    if (progress < 25) return <FiMic className="w-8 h-8 text-blue-400" />;
    if (progress < 75) return <FiCpu className="w-8 h-8 text-yellow-400" />;
    return <FiFileText className="w-8 h-8 text-green-400" />;
  };

  const getProgressColor = () => {
    if (progress < 25) return "from-blue-500 to-cyan-500";
    if (progress < 75) return "from-yellow-500 to-orange-500";
    return "from-green-500 to-emerald-500";
  };

  const getStepStatus = (stepProgress) => {
    if (progress >= stepProgress) return "completed";
    if (progress >= stepProgress - 25) return "active";
    return "pending";
  };

  const steps = [
    {
      progress: 25,
      title: "Audio Analysis",
      description: "Extracting audio from video",
      icon: FiMic,
    },
    {
      progress: 50,
      title: "Speech Processing",
      description: "Converting speech to text",
      icon: FiCpu,
    },
    {
      progress: 75,
      title: "Text Generation",
      description: "Generating formatted text",
      icon: FiFileText,
    },
    {
      progress: 100,
      title: "Finalization",
      description: "Preparing final results",
      icon: FiLoader,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-card p-8 text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-glow animate-pulse-slow">
            {getProgressIcon()}
          </div>
          <div>
            <h2 className="text-3xl font-heading font-bold text-white mb-2">
              Transcribing Your Video
            </h2>
            <p className="text-white/70 text-lg">
              Please wait while we process{" "}
              <span className="text-white font-medium">{videoFile?.name}</span>
            </p>
          </div>
        </div>

        {/* Circular Progress */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            {/* Background circle */}
            <svg
              className="w-32 h-32 transform -rotate-90"
              viewBox="0 0 144 144"
            >
              <circle
                cx="72"
                cy="72"
                r="60"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="12"
              />
              <circle
                cx="72"
                cy="72"
                r="60"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 60}`}
                strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
            {/* Progress percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="space-y-4">
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <div className="text-white text-lg font-medium">{status}</div>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const stepStatus = getStepStatus(step.progress);

            return (
              <div
                key={index}
                className={`glass-card p-4 space-y-3 transition-all duration-500 ${
                  stepStatus === "completed"
                    ? "bg-green-500/10 border-green-400/30"
                    : stepStatus === "active"
                    ? "bg-blue-500/10 border-blue-400/30 scale-105"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div
                  className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                    stepStatus === "completed"
                      ? "bg-green-500"
                      : stepStatus === "active"
                      ? "bg-blue-500 animate-pulse"
                      : "bg-white/20"
                  }`}
                >
                  {stepStatus === "completed" ? (
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <StepIcon
                      className={`w-6 h-6 ${
                        stepStatus === "active" ? "text-white" : "text-white/60"
                      }`}
                    />
                  )}
                </div>
                <div className="text-center">
                  <h4
                    className={`font-semibold ${
                      stepStatus === "completed"
                        ? "text-green-300"
                        : stepStatus === "active"
                        ? "text-white"
                        : "text-white/60"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p
                    className={`text-xs ${
                      stepStatus === "completed"
                        ? "text-green-200/80"
                        : stepStatus === "active"
                        ? "text-white/80"
                        : "text-white/50"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* File Information */}
        <div className="glass-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-white/60 text-sm font-medium">File Name</div>
              <div
                className="text-white font-semibold truncate"
                title={videoFile?.name}
              >
                {videoFile?.name}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-white/60 text-sm font-medium">File Size</div>
              <div className="text-white font-semibold">
                {videoFile?.size
                  ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB`
                  : "Unknown"}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-white/60 text-sm font-medium">Status</div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-semibold">
                  Processing...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionProgress;
