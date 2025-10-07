import axiosInstance from "./axiosInstace.config";

export const addNewArea = async (areaData: any) => {
    try{
        const response = await axiosInstance.post("/area/addArea", areaData);
        return response.data;
    }
    catch(error){
        console.error("Error adding area:", error);
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

export const getAllArea = async ({restaurantId,page,limit,search}: {restaurantId: string | null,page:number,limit:number,search:string}) => {
    try{
        const params=new URLSearchParams()

        if(restaurantId){
            params.append("restaurantId", restaurantId)
        }

        if(page){
            params.append("page", page)
        }

        if(limit){
            params.append("limit", limit)
        }

        if(search){
            params.append("search", search)
        }

        const response = await axiosInstance.get("/area/getAllArea", {params});
        return response.data;
    }
    catch(error){
        console.error("Error getting all area:", error);
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

export const updateArea = async (areaData: any) => {
    try{
        const response = await axiosInstance.put(`/area/updateArea?id=${areaData.id}`, areaData);
        return response.data;
    }
    catch(error){
        console.error("Error updating area:", error);
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

export const getAreaOverview = async ({restaurantId}: {restaurantId: string | null}) => {
    try{
        const response = await axiosInstance.get("/area/areaOverview", {params: {restaurantId}});
        return response.data;
    }
    catch(error){
        console.error("Error getting area overview:", error);
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
    