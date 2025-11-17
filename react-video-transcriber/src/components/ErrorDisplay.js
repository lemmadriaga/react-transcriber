import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { FiRefreshCw, FiHome, FiAlertTriangle } from "react-icons/fi";

const ErrorDisplay = ({ message, onRetry, onStartOver }) => {
  return (
    <div className="glass-card p-8 text-center space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-glow">
          <ExclamationTriangleIcon className="h-10 w-10 text-white" />
        </div>

        <h2 className="text-2xl font-heading font-bold text-white">
          Oops! Something went wrong
        </h2>

        <div className="glass-card bg-red-500/10 border-red-400/30 p-4">
          <div className="flex items-start space-x-3">
            <FiAlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 text-left">{message}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {onRetry && (
          <button
            className="btn-primary inline-flex items-center space-x-2"
            onClick={onRetry}
          >
            <FiRefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </button>
        )}

        {onStartOver && (
          <button
            className="btn-secondary inline-flex items-center space-x-2"
            onClick={onStartOver}
          >
            <FiHome className="w-5 h-5" />
            <span>Start Over</span>
          </button>
        )}
      </div>

      <div className="glass-card p-6 text-left">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <span>💡</span>
          <span>Common solutions</span>
        </h4>
        <ul className="space-y-2 text-white/70 text-sm">
          <li className="flex items-start space-x-3">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>Check your internet connection and try again</span>
          </li>
          <li className="flex items-start space-x-3">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>Ensure the video file is not corrupted or damaged</span>
          </li>
          <li className="flex items-start space-x-3">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>Try uploading a different video file to test</span>
          </li>
          <li className="flex items-start space-x-3">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>Refresh the page and start the process again</span>
          </li>
          <li className="flex items-start space-x-3">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>
              For Google Drive videos, ensure you have proper access permissions
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ErrorDisplay;
