import React, { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  FiFileText,
  FiDownload,
  FiCopy,
  FiRotateCcw,
  FiEdit3,
  FiSave,
  FiCheck,
  FiClock,
  FiType,
  FiHash,
} from "react-icons/fi";
import { useTranscription } from "../contexts/TranscriptionContext";
import jsPDF from "jspdf";

const TranscriptionResults = ({ videoFile, onStartOver }) => {
  const { transcriptionResult, updateTranscriptionResult } = useTranscription();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(transcriptionResult);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setEditedText(transcriptionResult);
    updateStats(transcriptionResult);
  }, [transcriptionResult]);

  const updateStats = (text) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const readingTime = Math.ceil(words / 200);

    setWordCount(words);
    setCharCount(characters);
    setReadTime(readingTime);
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    updateTranscriptionResult(editedText);
    updateStats(editedText);
    setIsEditing(false);
    showNotification("Changes saved successfully!");
  };

  const handleTextChange = (e) => {
    setEditedText(e.target.value);
  };

  const exportToPDF = async () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text("Video Transcription", 20, 30);

      doc.setFontSize(12);
      doc.text(`File: ${videoFile?.name || "Unknown"}`, 20, 50);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 65);
      doc.text(
        `Words: ${wordCount} | Characters: ${charCount} | Read time: ${readTime} min`,
        20,
        80
      );

      doc.setFontSize(10);
      const text = isEditing ? editedText : transcriptionResult;
      const lines = doc.splitTextToSize(text, 170);
      doc.text(lines, 20, 100);

      const fileName = `${
        videoFile?.name?.replace(/\.[^/.]+$/, "") || "transcription"
      }.pdf`;
      doc.save(fileName);

      showNotification("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      showNotification("Failed to generate PDF. Please try again.", "error");
    }
  };

  const exportToText = () => {
    try {
      const text = isEditing ? editedText : transcriptionResult;
      const fileName = `${
        videoFile?.name?.replace(/\.[^/.]+$/, "") || "transcription"
      }.txt`;

      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification("Text file downloaded successfully!");
    } catch (error) {
      console.error("Text export error:", error);
      showNotification(
        "Failed to download text file. Please try again.",
        "error"
      );
    }
  };

  const copyToClipboard = async () => {
    try {
      const text = isEditing ? editedText : transcriptionResult;
      await navigator.clipboard.writeText(text);
      showNotification("Copied to clipboard!");
    } catch (error) {
      const textArea = document.createElement("textarea");
      textArea.value = isEditing ? editedText : transcriptionResult;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showNotification("Copied to clipboard!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg backdrop-blur-sm animate-slide-down ${
            notification.type === "success"
              ? "bg-green-500/90 text-white border border-green-400/30"
              : "bg-red-500/90 text-white border border-red-400/30"
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === "success" ? (
              <FiCheck className="w-5 h-5" />
            ) : (
              <FiFileText className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="glass-card p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-glow">
              <DocumentTextIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-heading font-bold gradient-text">
                Transcription Complete!
              </h2>
              <p className="text-white/70 text-lg">
                Your video has been successfully transcribed
              </p>
            </div>
          </div>

          <button
            className="btn-secondary inline-flex items-center space-x-2"
            onClick={onStartOver}
          >
            <FiRotateCcw className="w-5 h-5" />
            <span>New Video</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="glass-card p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <FiType className="w-5 h-5 text-blue-400" />
              <span className="text-white/60 font-medium">Words</span>
            </div>
            <div className="text-2xl font-bold text-white">{wordCount}</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <FiHash className="w-5 h-5 text-green-400" />
              <span className="text-white/60 font-medium">Characters</span>
            </div>
            <div className="text-2xl font-bold text-white">{charCount}</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <FiClock className="w-5 h-5 text-purple-400" />
              <span className="text-white/60 font-medium">Read Time</span>
            </div>
            <div className="text-2xl font-bold text-white">{readTime} min</div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="glass-card p-8">
        <h3 className="text-2xl font-heading font-bold text-white mb-6 text-center">
          Export Options
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            className="btn-danger inline-flex items-center justify-center space-x-2 py-4"
            onClick={exportToPDF}
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Download PDF</span>
          </button>
          <button
            className="btn-success inline-flex items-center justify-center space-x-2 py-4"
            onClick={exportToText}
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Download TXT</span>
          </button>
          <button
            className="btn-secondary inline-flex items-center justify-center space-x-2 py-4"
            onClick={copyToClipboard}
          >
            <ClipboardDocumentIcon className="w-5 h-5" />
            <span>Copy to Clipboard</span>
          </button>
        </div>
      </div>

      {/* Transcription Content */}
      <div className="glass-card p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-8">
          <h3 className="text-2xl font-heading font-bold text-white">
            Transcription Text
          </h3>
          <div>
            {isEditing ? (
              <button
                className="btn-success inline-flex items-center space-x-2"
                onClick={handleSave}
              >
                <FiSave className="w-5 h-5" />
                <span>Save Changes</span>
              </button>
            ) : (
              <button
                className="btn-primary inline-flex items-center space-x-2"
                onClick={handleEdit}
              >
                <FiEdit3 className="w-5 h-5" />
                <span>Edit Text</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                className="input-glass w-full min-h-96 resize-vertical font-mono text-sm leading-relaxed"
                value={editedText}
                onChange={handleTextChange}
                placeholder="Edit your transcription here..."
                rows={20}
              />
              <div className="text-white/60 text-sm">
                Words:{" "}
                {editedText.trim() ? editedText.trim().split(/\s+/).length : 0}{" "}
                | Characters: {editedText.length}
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 bg-white/5">
              <div className="text-white/90 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                {transcriptionResult || "No transcription available"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptionResults;
