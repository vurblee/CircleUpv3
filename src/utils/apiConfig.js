import { Platform } from 'react-native';

// Function to get the backend URL dynamically
export const getBackendUrl = () => {
  const port = 5000; // Match your backend PORT
  let hostname;

  // For development in Expo Go or simulators/emulators
  if (__DEV__) {
    // Use localhost for local dev on the same machine
    hostname = 'localhost';
    // If testing on a physical device via hotspot, override with the laptop's IP manually during dev
    // e.g., hostname = '192.168.x.x'; // Uncomment and set this if needed
  } else {
    // For production (standalone app), use the device's current network IP
    // Since the app runs on the same machine as the backend, we can use localhost
    // For hotspot devices, they'll resolve the IP via the network
    hostname = 'localhost'; // Adjust if frontend is on a different device
  }

  return `http://${hostname}:${port}`;
};

// Base URL for API calls
export const API_BASE_URL = `${getBackendUrl()}/api`;

// URL for Socket.IO
export const SOCKET_SERVER_URL = "ws://192.168.137.62:5000";
