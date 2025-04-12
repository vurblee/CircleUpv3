import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Update the base URL with your IP address
const apiClient = axios.create({
  baseURL: "http://192.168.137.62:5000/api",
  headers: {
    "Content-Type": "application/json", // Added Content-Type header
  },
});

// Add a request interceptor to attach the token to each request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
