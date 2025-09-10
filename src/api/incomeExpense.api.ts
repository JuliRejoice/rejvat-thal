import axiosInstance from "./axiosInstace.config";

export const createIncomeExpense = async (incomeExpenseData) => {
    try {
        const incExpData = new FormData();
        incExpData.append("amount", incomeExpenseData?.amount);
        incExpData.append("method", incomeExpenseData?.method);
        incExpData.append("restaurantId", incomeExpenseData?.restaurantId);
        incExpData.append("description", incomeExpenseData?.description);
        incExpData.append("date", incomeExpenseData?.date);
        incExpData.append("type", incomeExpenseData?.type);
        if(incomeExpenseData?.expenseCategoryId){
            incExpData.append("expenseCategoryId", incomeExpenseData?.expenseCategoryId);
        }
        if(incomeExpenseData?.icnomeCategoryId){
            incExpData.append("icnomeCategoryId", incomeExpenseData?.icnomeCategoryId);
        }
        if (incomeExpenseData.file) {
            incExpData.append('file', incomeExpenseData.file);
        }

        const response = await axiosInstance.post(`/transaction/addTransaction`, incExpData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log("create transaction income & expense API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('create transaction income & expense API error:', error);

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

export const getIncomeExpense = async ({
    restaurantId,
    startDate,
    endDate,
    search,
    page,
    limit
}:{
    restaurantId?:any,
    startDate?:any,
    endDate?: any,
    search?: any,
    page: any,
    limit: any
}) => {
    try {

        const queryParams = new URLSearchParams();
        if(restaurantId) queryParams.append("restaurantId", restaurantId)
        if(search) queryParams.append("search", String(search));
        if(startDate !== undefined) queryParams.append("startDate", String(startDate));
        if(endDate !== undefined) queryParams.append("endDate", String(endDate));
        if(page !== undefined) queryParams.append("page", String(page));
        if(limit !== undefined) queryParams.append("limit", String(limit));

        const url = `/transaction/getAllTransaction${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

        const response = await axiosInstance.get(url);

        console.log("get transaction income & expense API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('get transaction income & expense API error:', error);

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

export const getIncomeExpenseByResto = async ({
    restaurantId,
    startDate,
    endDate,
}:{
    restaurantId?:any,
    startDate?:any,
    endDate?: any,
}) => {
    try {
        const queryParams = new URLSearchParams();
        if(restaurantId) queryParams.append("restaurantId", restaurantId)
        if(startDate !== undefined) queryParams.append("startDate", String(startDate));
        if(endDate !== undefined) queryParams.append("endDate", String(endDate));

        const url = `/transaction/getIncomeExpenseByResto${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

        const response = await axiosInstance.get(url);

        console.log("get transaction income & expense API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('get transaction income & expense API error:', error);

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
export const getTransactionByMethod = async ({
    restaurantId,
    startDate,
    endDate,
    search
}:{
    restaurantId?:any,
    startDate?:any,
    endDate?: any,
    search?: any
}) => {
    try {
        const queryParams = new URLSearchParams();
        if(restaurantId) queryParams.append("restaurantId", restaurantId)
        if(search !== undefined) queryParams.append("search", String(search));
        if(startDate !== undefined) queryParams.append("startDate", String(startDate));
        if(endDate !== undefined) queryParams.append("endDate", String(endDate));

        const url = `/transaction/getTransactionByMethod${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

        const response = await axiosInstance.get(url);

        console.log("get transaction income & expense API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('get transaction income & expense API error:', error);

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
