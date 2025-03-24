import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";

/**
 * Retrieves the token stored in AsyncStorage.
 * @returns {Promise<string|null>} The token string if it exists, otherwise null.
 */
export const getValidToken = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    return token;
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

/**
 * Decodes a JWT token.
 * @param {string} token - The JWT token.
 * @returns {Object|null} The decoded token object or null if decoding fails.
 */
export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Retrieves a valid userId from the stored token if available.
 * Checks if the token exists and is not expired.
 * Assumes that the decoded token has either a 'userId' or 'sub' field.
 * @returns {Promise<string|null>} The userId if valid, otherwise null.
 */
export const getValidUserId = async () => {
  try {
    const token = await getValidToken();
    if (!token) {
      console.warn("No token found in AsyncStorage.");
      return null;
    }
    const decoded = decodeToken(token);
    if (!decoded) {
      console.warn("Token could not be decoded.");
      return null;
    }
    const currentTime = Date.now() / 1000; // in seconds
    if (decoded.exp && decoded.exp < currentTime) {
      console.warn("Token is expired.");
      return null;
    }
    // Adjust this line based on how your token stores the user ID
    const userId = decoded.userId || decoded.sub;
    if (!userId) {
      console.warn("Token does not include a userId or sub field.");
    }
    return userId;
  } catch (error) {
    console.error("Error in getValidUserId:", error);
    return null;
  }
};
