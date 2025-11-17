import React from "react";
import {
  CogIcon,
  PlayIcon,
  ClockIcon,
  UserGroupIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import {
  FiSettings,
  FiPlay,
  FiClock,
  FiUsers,
  FiGlobe,
  FiZap,
} from "react-icons/fi";
import { useTranscription } from "../contexts/TranscriptionContext";

const TranscriptionSettings = ({
  videoFile,
  onTranscriptionStart,
  onError,
}) => {
  const { settings, updateSettings, startTranscription } = useTranscription();

  const handleSettingChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  const handleStartTranscription = async () => {
    try {
      if (!videoFile) {
        throw new Error("No video file selected");
      }

      await startTranscription(videoFile);
      onTranscriptionStart();
    } catch (error) {
      onError && onError(error.message);
    }
  };

  const languages = [
    { code: "en-US", name: "English (US)", flag: "🇺🇸" },
    { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
    { code: "es-ES", name: "Spanish", flag: "🇪🇸" },
    { code: "fr-FR", name: "French", flag: "🇫🇷" },
    { code: "de-DE", name: "German", flag: "🇩🇪" },
    { code: "it-IT", name: "Italian", flag: "🇮🇹" },
    { code: "pt-BR", name: "Portuguese (Brazil)", flag: "🇧🇷" },
    { code: "ja-JP", name: "Japanese", flag: "🇯🇵" },
    { code: "ko-KR", name: "Korean", flag: "🇰🇷" },
    { code: "zh-CN", name: "Chinese (Simplified)", flag: "🇨🇳" },
  ];

  const qualities = [
    {
      value: "standard",
      name: "Standard",
      description: "Good quality, faster processing",
      icon: "⚡",
      time: "2-3 minutes",
    },
    {
      value: "enhanced",
      name: "Enhanced",
      description: "Better accuracy, moderate processing time",
      icon: "🎯",
      time: "3-5 minutes",
    },
    {
      value: "premium",
      name: "Premium",
      description: "Best quality, longest processing time",
      icon: "💎",
      time: "5-8 minutes",
    },
  ];

  const selectedQuality = qualities.find((q) => q.value === settings.quality);

  return (
    <div className="glass-card p-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
          <CogIcon className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-heading font-bold text-white mb-2">
            Transcription Settings
          </h3>
          <p className="text-white/70">
            Configure your transcription preferences for optimal results
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Language Selection */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FiGlobe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">Language</h4>
              <p className="text-white/60 text-sm">
                Select the primary language of your video
              </p>
            </div>
          </div>

          <select
            className="input-glass w-full"
            value={settings.language}
            onChange={(e) => handleSettingChange("language", e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quality Selection */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FiZap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">Quality</h4>
              <p className="text-white/60 text-sm">
                Choose transcription accuracy level
              </p>
            </div>
          </div>

          <select
            className="input-glass w-full"
            value={settings.quality}
            onChange={(e) => handleSettingChange("quality", e.target.value)}
          >
            {qualities.map((quality) => (
              <option key={quality.value} value={quality.value}>
                {quality.icon} {quality.name}
              </option>
            ))}
          </select>

          {selectedQuality && (
            <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-3">
              <p className="text-purple-200 text-sm">
                {selectedQuality.description}
              </p>
              <p className="text-purple-300 text-xs mt-1">
                ⏱️ Estimated time: {selectedQuality.time}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Features */}
      <div className="space-y-4">
        <h4 className="text-xl font-semibold text-white text-center">
          Advanced Features
        </h4>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Timestamps Toggle */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <FiClock className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h5 className="text-lg font-semibold text-white">
                    Include Timestamps
                  </h5>
                  <p className="text-white/60 text-sm mt-1">
                    Add time markers to track when each segment was spoken
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.includeTimestamps}
                  onChange={(e) =>
                    handleSettingChange("includeTimestamps", e.target.checked)
                  }
                />
                <div className="relative w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-blue-500"></div>
              </label>
            </div>
          </div>

          {/* Speaker Identification Toggle */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <FiUsers className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h5 className="text-lg font-semibold text-white">
                    Speaker Identification
                  </h5>
                  <p className="text-white/60 text-sm mt-1">
                    Identify and label different speakers in the conversation
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.includeSpeakers}
                  onChange={(e) =>
                    handleSettingChange("includeSpeakers", e.target.checked)
                  }
                />
                <div className="relative w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-blue-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Start Transcription */}
      <div className="text-center space-y-4">
        <button
          className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-3 hover:scale-105 transform transition-all duration-300"
          onClick={handleStartTranscription}
        >
          <FiPlay className="w-6 h-6" />
          <span>Start Transcription</span>
        </button>

        <div className="flex items-center justify-center space-x-2 text-white/60">
          <FiClock className="w-4 h-4" />
          <span className="text-sm">
            Estimated processing time:{" "}
            {selectedQuality ? selectedQuality.time : "2-5 minutes"}
          </span>
        </div>

        <div className="glass-card p-4 max-w-md mx-auto">
          <p className="text-white/70 text-sm">
            💡 <strong>Tip:</strong> Higher quality settings provide more
            accurate results but take longer to process.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionSettings;
