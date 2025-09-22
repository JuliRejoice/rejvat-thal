import { getToken } from "@/lib/utils";
import axiosInstance from "./axiosInstace.config";

// Notifications: fetch list
export const getNotificationList = async () => {
    try {
      const response = await axiosInstance.get(`/notification`,{
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": `${getToken()}`,
          "Ngrok-Skip-Browser-Warning": "true"
        }
      });
      console.log("get notification list API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("get notification list API error:", error);
      if (error.response) {
        const errorMessage = error.response.data.message;
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error("An unexpected error occurred");
      }
    }
  }


  export const markAsRead = async (id:string) =>{
    try {
        const response = await axiosInstance.put(`/notification/mark/${id}`);
        console.log("mark as read API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("mark as read API error:", error);
    }
  }

  export const markAllAsRead = async () =>{
    try {
        const response = await axiosInstance.put(`/notification/mark-all`);
        console.log("mark all as read API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("mark all as read API error:", error);
    }
  }