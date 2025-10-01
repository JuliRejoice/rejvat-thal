import axiosInstance from "./axiosInstace.config";

type Restaurant = {
    name: string;
    email: string;
    phone: string;
    address: string;
}

type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

type QueryData = {
    search?: string;
    page?: number;
    limit?: number;
    status?: boolean;
}

export type RestaurantData = {
    _id: string;
    email: string;
    name: string;
    phone: string;
    address: string;
    managerId: string;
    isActive: string;
    createdAt: string;
    updatedAt: string;
}

export const createRestaurant = async (restaurantData: Restaurant): Promise<ApiResponse<Restaurant>> => {
    try {
        const response = await axiosInstance.post(`/restaurant/createRestaurant`, restaurantData);

        console.log("create restaurant API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('create restaurant API error:', error);

        if (error.response) {
            const errorMessage = error.response.data.message;
            throw new Error(errorMessage);
        } else if (error.request) {
            throw new Error('Network error. Please check your connection.');
        } else {
            throw new Error('An unexpected error occurred');
        }
    }
}

export const updateRestaurant = async (restaurantData: Restaurant, id: string): Promise<ApiResponse<Restaurant>> => {
    try {
        const response = await axiosInstance.put(`/restaurant/updateRestaurant?id=${id}`, restaurantData);

        console.log("update restaurant API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('update restaurant API error:', error);

        if (error.response) {
            const errorMessage = error.response.data.message;
            throw new Error(errorMessage);
        } else if (error.request) {
            throw new Error('Network error. Please check your connection.');
        } else {
            throw new Error('An unexpected error occurred');
        }
    }
}

export const updateRestaurantStatus = async (isActive: boolean, id: string) => {
    try {
        const response = await axiosInstance.put(`/restaurant/updateRestaurantStatus?id=${id}`, {
            isActive: isActive
        });

        console.log("update restaurant status API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('update restaurant status API error:', error);

        if (error.response) {
            const errorMessage = error.response.data.message;
            throw new Error(errorMessage);
        } else if (error.request) {
            throw new Error('Network error. Please check your connection.');
        } else {
            throw new Error('An unexpected error occurred');
        }
    }
}

export const getRestaurants = async ({ search, page, limit, status}: QueryData) => {
    try {
        const queryParams = new URLSearchParams();

        if (search) queryParams.append("search", search);
        if (page !== undefined) queryParams.append("page", String(page));
        if (limit !== undefined) queryParams.append("limit", String(limit));
        if (status !== undefined) queryParams.append("isActive", String(status));

        const url = `/restaurant/getAllRestaurant${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

        const response = await axiosInstance.get(url);

        console.log("get all restaurant API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('get all restaurant API error:', error);

        if (error.response) {
            const errorMessage = error.response.data.message;
            throw new Error(errorMessage);
        } else if (error.request) {
            throw new Error('Network error. Please check your connection.');
        } else {
            throw new Error('An unexpected error occurred');
        }
    }
}

export const getRestaurantOverview = async () => {

    try {
        const response = await axiosInstance.get(`/restaurant/getRestoDashDetails`);

        console.log("get restaurant overview API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('get restaurant overview API error:', error);

        if (error.response) {
            const errorMessage = error.response.data.message;
            throw new Error(errorMessage);
        } else if (error.request) {
            throw new Error('Network error. Please check your connection.');
        } else {
            throw new Error('An unexpected error occurred');
        }
    }
}