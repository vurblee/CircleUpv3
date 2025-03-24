import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create an Axios instance with your backend's base URL
const apiClient = axios.create({
<<<<<<< HEAD
  baseURL: "http://192.168.1.231:5000/api", // <- Replace with your PC IP for iPhone access
=======
  baseURL: "http://localhost:5000/api", // Change this if using a different URL or port
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
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
