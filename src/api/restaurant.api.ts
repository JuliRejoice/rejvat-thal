import axiosInstance from "./axiosInstace.config";

export const createRestaurant = async (restaurantData) => {
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

export const updateRestaurant = async (restaurantData, id) => {
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

export const getRestaurants = async ({ search, page, limit, status }) => {
    try {
        const response = await axiosInstance.get(
            `/restaurant/getAllRestaurant?${search ? `&search=${search}` : ""}&page=${page}&limit=${limit}${status !== undefined ? `&isActive=${status}` : ""}
        `);

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