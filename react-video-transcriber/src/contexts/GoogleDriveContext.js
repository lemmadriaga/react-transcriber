import React, { createContext, useContext, useState, useCallback } from 'react';

// Google Drive API configuration
const GOOGLE_DRIVE_CONFIG = {
  apiKey: 'YOUR_API_KEY_HERE', // Replace with your actual API key
  clientId: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com', // Replace with your actual client ID
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
  scopes: 'https://www.googleapis.com/auth/drive.readonly'
};

const GoogleDriveContext = createContext();

export const useGoogleDrive = () => {
  const context = useContext(GoogleDriveContext);
  if (!context) {
    throw new Error('useGoogleDrive must be used within a GoogleDriveProvider');
  }
  return context;
};

export const GoogleDriveProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const initializeGoogleAPI = useCallback(async () => {
    try {
      // Check if gapi is available
      if (!window.gapi) {
        throw new Error('Google API not loaded. Please refresh the page.');
      }

      await new Promise((resolve) => {
        window.gapi.load('client:auth2', resolve);
      });

      await window.gapi.client.init(GOOGLE_DRIVE_CONFIG);
      
      const authInstance = window.gapi.auth2.getAuthInstance();
      const isSignedIn = authInstance.isSignedIn.get();
      
      setIsConnected(isSignedIn);
      setIsInitialized(true);
      
      if (isSignedIn) {
        const currentUser = authInstance.currentUser.get();
        setUser(currentUser.getBasicProfile());
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Google API:', error);
      setError(error.message);
      return false;
    }
  }, []);

  const connectToGoogleDrive = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Initialize if not already done
      if (!isInitialized) {
        const initialized = await initializeGoogleAPI();
        if (!initialized) {
          throw new Error('Failed to initialize Google Drive API');
        }
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      
      if (!authInstance.isSignedIn.get()) {
        const result = await authInstance.signIn();
        const profile = result.getBasicProfile();
        setUser(profile);
      }
      
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error('Google Drive connection failed:', error);
      let errorMessage = 'Failed to connect to Google Drive. ';
      
      if (error.error === 'popup_blocked_by_browser') {
        errorMessage += 'Please allow popups and try again.';
      } else if (error.error === 'access_denied') {
        errorMessage += 'Access denied. Please grant permission to access your Google Drive.';
      } else {
        errorMessage += 'Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, [isInitialized, initializeGoogleAPI]);

  const disconnect = useCallback(async () => {
    try {
      if (isInitialized && window.gapi.auth2) {
        const authInstance = window.gapi.auth2.getAuthInstance();
        await authInstance.signOut();
      }
      
      setIsConnected(false);
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }, [isInitialized]);

  const listVideos = useCallback(async (pageSize = 20, pageToken = null) => {
    try {
      if (!isConnected) {
        throw new Error('Not connected to Google Drive');
      }

      const params = {
        q: "mimeType contains 'video/' and trashed=false",
        fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink)',
        pageSize: pageSize,
        orderBy: 'modifiedTime desc'
      };

      if (pageToken) {
        params.pageToken = pageToken;
      }

      const response = await window.gapi.client.drive.files.list(params);
      
      return {
        files: response.result.files || [],
        nextPageToken: response.result.nextPageToken
      };
    } catch (error) {
      console.error('Failed to list videos:', error);
      throw new Error('Failed to retrieve videos from Google Drive');
    }
  }, [isConnected]);

  const getFileMetadata = useCallback(async (fileId) => {
    try {
      const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, description, webViewLink, thumbnailLink'
      });
      return response.result;
    } catch (error) {
      console.error('Failed to get file metadata:', error);
      throw new Error('Failed to get file information');
    }
  }, []);

  const extractFileIdFromLink = useCallback((driveLink) => {
    // Extract file ID from various Google Drive link formats
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9-_]+)/, // https://drive.google.com/file/d/FILE_ID/view
      /id=([a-zA-Z0-9-_]+)/, // https://drive.google.com/open?id=FILE_ID
      /\/d\/([a-zA-Z0-9-_]+)/ // https://docs.google.com/document/d/FILE_ID/
    ];

    for (const pattern of patterns) {
      const match = driveLink.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // If no pattern matches, assume the input is already a file ID
    if (/^[a-zA-Z0-9-_]+$/.test(driveLink)) {
      return driveLink;
    }

    return null;
  }, []);

  const accessSharedVideo = useCallback(async (driveLink) => {
    try {
      if (!isConnected) {
        throw new Error('Not connected to Google Drive. Please sign in first.');
      }

      const fileId = extractFileIdFromLink(driveLink);
      if (!fileId) {
        throw new Error('Invalid Google Drive link. Please provide a valid share link.');
      }

      // Try to get file metadata (this works for shared files if you have view access)
      const metadata = await getFileMetadata(fileId);
      
      // Check if it's a video file
      if (!metadata.mimeType.includes('video/')) {
        throw new Error('The shared file is not a video. Please share a video file.');
      }

      // Get download/streaming URL
      const downloadResponse = await window.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      return {
        ...metadata,
        downloadUrl: downloadResponse.body ? URL.createObjectURL(new Blob([downloadResponse.body])) : null,
        accessMethod: 'shared_link'
      };
    } catch (error) {
      console.error('Failed to access shared video:', error);
      
      if (error.status === 403) {
        throw new Error('Access denied. You may not have permission to view this file, or the file sharing settings may be too restrictive.');
      } else if (error.status === 404) {
        throw new Error('File not found. The link may be invalid or the file may have been deleted.');
      } else {
        throw new Error(error.message || 'Failed to access shared video. Please check the link and your permissions.');
      }
    }
  }, [isConnected, extractFileIdFromLink, getFileMetadata]);

  const value = {
    isInitialized,
    isConnected,
    isConnecting,
    user,
    error,
    connectToGoogleDrive,
    disconnect,
    listVideos,
    getFileMetadata,
    extractFileIdFromLink,
    accessSharedVideo,
    initializeGoogleAPI
  };

  return (
    <GoogleDriveContext.Provider value={value}>
      {children}
    </GoogleDriveContext.Provider>
  );
};