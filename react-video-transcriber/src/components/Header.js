import React from "react";
import { PlayCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import {
  FiVideo,
  FiZap,
  FiShield,
  FiGlobe,
  FiFileText,
  FiLock,
} from "react-icons/fi";

const Header = () => {
  return (
    <header className="relative bg-white/5 backdrop-blur-md border-b border-white/10">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
      <div className="relative max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8">
          <div className="flex items-center space-x-4 mb-6 lg:mb-0">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-glow">
              <PlayCircleIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-heading font-bold gradient-text">
                Video Transcriber Pro
              </h1>
              <div className="flex items-center space-x-2 mt-2">
                <SparklesIcon className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold text-sm">
                  AI-Powered
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="glass-card px-4 py-2 flex items-center space-x-2">
              <FiZap className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/90">
                Real-time Processing
              </span>
            </div>
            <div className="glass-card px-4 py-2 flex items-center space-x-2">
              <FiShield className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-white/90">
                Privacy First
              </span>
            </div>
          </div>
        </div>

        <div className="text-center lg:text-left">
          <p className="text-xl text-white/90 mb-6 max-w-4xl mx-auto lg:mx-0 leading-relaxed">
            Professional video transcription for Google Drive videos with
            advanced AI speech recognition and multi-format export
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            <div className="glass-card-hover px-4 py-2 flex items-center space-x-2">
              <FiGlobe className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white/90">
                Multi-Language Support
              </span>
            </div>
            <div className="glass-card-hover px-4 py-2 flex items-center space-x-2">
              <FiFileText className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-white/90">
                PDF & Text Export
              </span>
            </div>
            <div className="glass-card-hover px-4 py-2 flex items-center space-x-2">
              <FiLock className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-white/90">
                Secure Processing
              </span>
            </div>
            <div className="glass-card-hover px-4 py-2 flex items-center space-x-2">
              <FiVideo className="h-4 w-4 text-pink-400" />
              <span className="text-sm font-medium text-white/90">
                HD Video Support
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
