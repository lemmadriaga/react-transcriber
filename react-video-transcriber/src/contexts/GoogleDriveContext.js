import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

// Google Drive API configuration
const GOOGLE_CONFIG = {
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  scope: "https://www.googleapis.com/auth/drive.readonly",
};

// Debug environment variables
console.log("Environment Variables Check:");
console.log(
  "REACT_APP_GOOGLE_API_KEY:",
  process.env.REACT_APP_GOOGLE_API_KEY ? "Set" : "NOT SET"
);
console.log(
  "REACT_APP_GOOGLE_CLIENT_ID:",
  process.env.REACT_APP_GOOGLE_CLIENT_ID ? "Set" : "NOT SET"
);
console.log("Full config:", GOOGLE_CONFIG);

const GoogleDriveContext = createContext();

export const useGoogleDrive = () => {
  const context = useContext(GoogleDriveContext);
  if (!context) {
    throw new Error("useGoogleDrive must be used within a GoogleDriveProvider");
  }
  return context;
};

export const GoogleDriveProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const initializeGoogleAPI = useCallback(async () => {
    try {
      console.log("Initializing Google Identity Services (no gapi)...");

      // Check if Google Identity Services is available
      if (!window.google || !window.google.accounts) {
        throw new Error(
          "Google Identity Services not loaded. Please refresh the page."
        );
      }

      console.log("Google Identity Services available");
      setIsInitialized(true);
      return true;
    } catch (error) {
      console.error("Failed to initialize Google API:", error);
      setError(error.message);
      return false;
    }
  }, []);

  const connectToGoogleDrive = useCallback(async () => {
    try {
      console.log("connectToGoogleDrive called (REST API approach)");
      setIsConnecting(true);
      setError(null);

      // Initialize if not already done
      if (!isInitialized) {
        console.log("Not initialized, initializing...");
        const initialized = await initializeGoogleAPI();
        if (!initialized) {
          throw new Error("Failed to initialize Google Drive API");
        }
      }

      // Use Google Identity Services for authentication
      if (!window.google || !window.google.accounts) {
        throw new Error("Google Identity Services not loaded");
      }

      console.log("Requesting access token via Google Identity Services...");

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.clientId,
        scope: GOOGLE_CONFIG.scope,
        callback: (response) => {
          if (response.error) {
            console.error("OAuth error:", response.error);
            setError(`Authentication failed: ${response.error}`);
            setIsConnecting(false);
            return;
          }

          console.log("Access token received successfully");

          setAccessToken(response.access_token);
          setIsConnected(true);
          setIsConnecting(false);
          console.log("Successfully connected to Google Drive");
        },
      });

      tokenClient.requestAccessToken();
    } catch (error) {
      console.error("Google Drive connection failed:", error);
      setError(`Failed to connect to Google Drive: ${error.message}`);
      setIsConnecting(false);
      throw new Error(
        "Failed to connect to Google Drive. Please check your internet connection and try again."
      );
    }
  }, [isInitialized, initializeGoogleAPI]);

  // Auto-initialize on mount
  useEffect(() => {
    const initializeWithDelay = async () => {
      // Wait a bit for gapi to load
      await new Promise((resolve) => setTimeout(resolve, 1000));
      initializeGoogleAPI();
    };

    initializeWithDelay();
  }, [initializeGoogleAPI]);

  const disconnect = useCallback(() => {
    try {
      setAccessToken(null);
      setIsConnected(false);
      setUser(null);
      setError(null);
      console.log("Disconnected from Google Drive");
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  }, []);

  const makeGoogleDriveAPICall = useCallback(
    async (endpoint, params = {}) => {
      if (!accessToken) {
        throw new Error("Not authenticated. Please sign in first.");
      }

      const url = new URL(`https://www.googleapis.com/drive/v3/${endpoint}`);

      // Add API key and access token
      url.searchParams.append("key", GOOGLE_CONFIG.apiKey);

      // Add other parameters
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Google Drive API error: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    },
    [accessToken]
  );

  const listVideos = useCallback(
    async (pageSize = 20, pageToken = null) => {
      try {
        if (!isConnected) {
          throw new Error("Not connected to Google Drive");
        }

        console.log("Listing videos via REST API...");

        const params = {
          q: "mimeType contains 'video/' and trashed=false",
          fields:
            "nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink)",
          pageSize: pageSize.toString(),
          orderBy: "modifiedTime desc",
        };

        if (pageToken) {
          params.pageToken = pageToken;
        }

        const result = await makeGoogleDriveAPICall("files", params);

        return {
          files: result.files || [],
          nextPageToken: result.nextPageToken,
        };
      } catch (error) {
        console.error("Failed to list videos:", error);
        throw new Error("Failed to retrieve videos from Google Drive");
      }
    },
    [isConnected, makeGoogleDriveAPICall]
  );

  const getFileMetadata = useCallback(
    async (fileId) => {
      try {
        const result = await makeGoogleDriveAPICall(`files/${fileId}`, {
          fields:
            "id, name, mimeType, size, createdTime, modifiedTime, description, webViewLink, thumbnailLink",
        });
        return result;
      } catch (error) {
        console.error("Failed to get file metadata:", error);
        throw new Error("Failed to get file information");
      }
    },
    [makeGoogleDriveAPICall]
  );

  const extractFileIdFromLink = useCallback((driveLink) => {
    // Extract file ID from various Google Drive link formats
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9-_]+)/, // https://drive.google.com/file/d/FILE_ID/view
      /id=([a-zA-Z0-9-_]+)/, // https://drive.google.com/open?id=FILE_ID
      /\/d\/([a-zA-Z0-9-_]+)/, // https://docs.google.com/document/d/FILE_ID/
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

  const accessSharedVideo = useCallback(
    async (driveLink) => {
      try {
        if (!isConnected) {
          throw new Error(
            "Not connected to Google Drive. Please sign in first."
          );
        }

        const fileId = extractFileIdFromLink(driveLink);
        if (!fileId) {
          throw new Error(
            "Invalid Google Drive link. Please provide a valid share link."
          );
        }

        // Try to get file metadata (this works for shared files if you have view access)
        const metadata = await getFileMetadata(fileId);

        // Check if it's a video file
        if (!metadata.mimeType.includes("video/")) {
          throw new Error(
            "The shared file is not a video. Please share a video file."
          );
        }

        // For shared files, we'll use the webViewLink
        return {
          ...metadata,
          downloadUrl: null, // Direct download may not be available for shared files
          accessMethod: "shared_link",
        };
      } catch (error) {
        console.error("Failed to access shared video:", error);

        if (error.message.includes("403")) {
          throw new Error(
            "Access denied. You may not have permission to view this file, or the file sharing settings may be too restrictive."
          );
        } else if (error.message.includes("404")) {
          throw new Error(
            "File not found. The link may be invalid or the file may have been deleted."
          );
        } else {
          throw new Error(
            error.message ||
              "Failed to access shared video. Please check the link and your permissions."
          );
        }
      }
    },
    [isConnected, extractFileIdFromLink, getFileMetadata]
  );

  const value = {
    isInitialized,
    isSignedIn: isConnected,
    isLoading: isConnecting,
    user,
    error,
    signIn: connectToGoogleDrive,
    signOut: disconnect,
    connectToGoogleDrive,
    disconnect,
    listVideos,
    getFileMetadata,
    extractFileIdFromLink,
    accessSharedVideo,
    pickVideo: listVideos,
    initializeGoogleAPI,
    isConnected,
    accessToken,
  };

  return (
    <GoogleDriveContext.Provider value={value}>
      {children}
    </GoogleDriveContext.Provider>
  );
};
