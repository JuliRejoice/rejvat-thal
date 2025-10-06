import { getToken } from "@/lib/utils";
import axios from "axios";
import { toast } from "@/hooks/use-toast";


const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
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
    toast({
      title: "Request failed",
      description: error?.response?.data?.message || error.message,
      variant: "destructive",
    });
    return Promise.reject(error);
  }
);


export default axiosInstance;