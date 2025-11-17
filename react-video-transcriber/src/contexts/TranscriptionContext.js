import React, { createContext, useContext, useState, useCallback } from 'react';

const TranscriptionContext = createContext();

export const useTranscription = () => {
  const context = useContext(TranscriptionContext);
  if (!context) {
    throw new Error('useTranscription must be used within a TranscriptionProvider');
  }
  return context;
};

export const TranscriptionProvider = ({ children }) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [settings, setSettings] = useState({
    language: 'en-US',
    quality: 'standard',
    includeTimestamps: true,
    includeSpeakers: false
  });
  const [error, setError] = useState(null);

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const startTranscription = useCallback(async (videoFile) => {
    try {
      setIsTranscribing(true);
      setError(null);
      setProgress(0);
      setStatus('Initializing transcription...');
      
      // Simulate transcription process with realistic progress updates
      const steps = [
        { progress: 10, status: 'Analyzing audio track...', delay: 1000 },
        { progress: 25, status: 'Processing speech segments...', delay: 1500 },
        { progress: 50, status: 'Converting speech to text...', delay: 2000 },
        { progress: 75, status: 'Applying language model...', delay: 1500 },
        { progress: 90, status: 'Finalizing transcription...', delay: 1000 },
        { progress: 100, status: 'Transcription complete!', delay: 500 }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
        setProgress(step.progress);
        setStatus(step.status);
      }

      // Generate sample transcription based on settings
      const result = generateSampleTranscription(settings, videoFile);
      setTranscriptionResult(result);
      
      return result;
    } catch (error) {
      console.error('Transcription failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsTranscribing(false);
    }
  }, [settings]);

  const clearTranscription = useCallback(() => {
    setTranscriptionResult('');
    setProgress(0);
    setStatus('');
    setError(null);
  }, []);

  const updateTranscriptionResult = useCallback((newResult) => {
    setTranscriptionResult(newResult);
  }, []);

  const value = {
    isTranscribing,
    transcriptionResult,
    progress,
    status,
    settings,
    error,
    updateSettings,
    startTranscription,
    clearTranscription,
    updateTranscriptionResult
  };

  return (
    <TranscriptionContext.Provider value={value}>
      {children}
    </TranscriptionContext.Provider>
  );
};

// Helper function to generate sample transcription
function generateSampleTranscription(settings, videoFile) {
  const baseText = `Welcome to our video presentation. Today we'll be discussing the latest developments in artificial intelligence and machine learning technologies.

The field of AI has seen remarkable progress in recent years, particularly in areas such as natural language processing, computer vision, and predictive analytics.

Machine learning algorithms have become increasingly sophisticated, enabling applications that were once considered science fiction to become reality.

Some key areas of advancement include deep learning neural networks, reinforcement learning systems, and automated machine learning platforms.

These technologies are now being applied across various industries including healthcare, finance, transportation, and entertainment.

The future of AI looks promising with continued research and development in areas such as quantum computing integration and edge AI deployment.

Thank you for watching our presentation. We hope you found this information valuable and look forward to your questions.`;

  let result = baseText;

  if (settings.includeTimestamps) {
    const lines = result.split('\n\n');
    result = lines.map((line, index) => {
      const timestamp = formatTimestamp(index * 30); // 30 seconds apart
      return `[${timestamp}] ${line}`;
    }).join('\n\n');
  }

  if (settings.includeSpeakers) {
    const lines = result.split('\n\n');
    result = lines.map((line, index) => {
      const speaker = index % 2 === 0 ? 'Speaker 1' : 'Speaker 2';
      return `${speaker}: ${line}`;
    }).join('\n\n');
  }

  return result;
}

// Helper function to format timestamp
function formatTimestamp(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}