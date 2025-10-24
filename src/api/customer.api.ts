import { Customer, getCustomerOverviewPayload, GetCustomerParams } from "@/types/customer.types";
import axiosInstance from "./axiosInstace.config";

export interface ReceivePaymentPayload {
  customerId: string;
  amount: number;
  date: string;
  method: string;
  description?: string;
  incomeCategoryId: string;
}

const handleError = (error) => {
  console.error("get customer API error:", error);
  if (error.response) {
    const errorMessage = error.response.data.message;
    throw new Error(errorMessage);
  } else if (error.request) {
    throw new Error("Network error. Please check your connection.");
  } else {
    throw new Error("An unexpected error occurred");
  }
};

export const createNewCustomer = async (customerData: Customer) => {
  try {
    const response = await axiosInstance.post(`/customer`, customerData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getCustomer = async (data: GetCustomerParams) => {
  try {
    const queryParts: string[] = [];

    if (data.page) queryParts.push(`page=${data.page}`);
    if (data.limit) queryParts.push(`limit=${data.limit}`);
    if (data.searchTerm) queryParts.push(`search=${data.searchTerm}`);
    if (data.restaurantId) queryParts.push(`restaurantId=${data.restaurantId}`);
    if (data.isActive){
      if(data.isActive != "all"){
        queryParts.push(`isActive=${data.isActive}`);
      }
    }
    const query = queryParts.length ? `?${queryParts.join("&")}` : "";

    const response = await axiosInstance.get(`/customer${query}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getCustomerDetails = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/customer/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getCustomerOverview = async (data: getCustomerOverviewPayload | null) => {
  try {
    const queryParts: string[] = [];

    if (data?.restaurantId) queryParts.push(`restaurantId=${data.restaurantId}`);
    const query = queryParts.length ? `?${queryParts.join("&")}` : "";
    const response = await axiosInstance.get(`/customer/overview${query}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateCustomer = async (id: string, customerData: Customer) => {
  try {
    const response = await axiosInstance.put(`/customer/${id}`, customerData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

interface GetCustomerPaymentParams {
  methodId: string;
  page?: number;
  limit?: number;
}


export const receivePayment = async (data: ReceivePaymentPayload) => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });
    
    const response = await axiosInstance.post(`/customer/receive-payment`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getCustomerPaymentList = async (customerId: string, params: GetCustomerPaymentParams) => {
  try {
    const queryParts: string[] = [];

    if (params.methodId) queryParts.push(`method=${params.methodId}`);
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    
    const query = queryParts.length ? `?${queryParts.join('&')}` : '';
    
    const response = await axiosInstance.get(`/customer/payment-list/${customerId}${query}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
