import { getToken } from "@/lib/utils";
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
          "Ngrok-Skip-Browser-Warning": "true"
    }
})

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);


export default axiosInstance;