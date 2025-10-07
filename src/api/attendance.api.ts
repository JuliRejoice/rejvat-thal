import axiosInstance from "./axiosInstace.config";

export const createAttendance = async (attendanceData) => {
  try {
    const attendData = new FormData();

    attendData.append("notes", attendanceData.notes);
    attendData.append("restaurantId", attendanceData.restaurantId);
    attendData.append("date", attendanceData.date);
    attendData.append("checkInAt", attendanceData.checkInAt);
    attendData.append("status", attendanceData.status);
    if (attendanceData.file) {
      attendData.append("file", attendanceData.file);
    }
    const response = await axiosInstance.post(
      `/attendance/addNewAttendance`,
      attendData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("create attendance API Response:", response.data);

    return response.data;
  } catch (error) {
    console.error("create attendance API error:", error);

    if (error.response) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("Network error. Please check your connection.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const getStaffAttendance = async ({
  page,
  limit,
  search,
  isActive,
  startDate,
  endDate,
}: {
  page?: any;
  limit?: any;
  search?: any;
  isActive?: any;
  startDate?: any;
  endDate?: any;
}) => {
  try {
    const queryParams = new URLSearchParams();
    if (startDate !== undefined)
      queryParams.append("startDate", String(startDate));
    if (endDate !== undefined) queryParams.append("endDate", String(endDate));
    // if (page !== undefined) queryParams.append("page", String(page));
    // if (limit !== undefined) queryParams.append("limit", String(limit));
    // if (search) queryParams.append("search", String(search));
    // if (isActive !== undefined)
    //   queryParams.append("isActive", String(isActive));

    const url = `/attendance/getAllAttendance${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await axiosInstance.get(url);

    console.log("get all vendor API Response:", response.data);

    return response.data;
  } catch (error) {
    console.error("get all vendor API error:", error);

    if (error.response) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("Network error. Please check your connection.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const getStaffAttendanceByRest = async (
  id: string,
  startDate?: string | number | Date,
  endDate?: string | number | Date
) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("restaurantId", String(id));
    if (startDate !== undefined)
      queryParams.append("startDate", String(startDate));
    if (endDate !== undefined) queryParams.append("endDate", String(endDate));

    const url = `/attendance/getRestaurantByAttendance?${queryParams.toString()}`;
    const response = await axiosInstance.get(url);

    console.log(
      "get all staff attendance by restaurant API Response:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error("get all staff attendance by restaurant API error:", error);

    if (error.response) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("Network error. Please check your connection.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const getAttendanceAndLeaveByStaff = async (id: string) => {
  try {
    const url = `/user/getStaffAttendanceAndLeave?uid=${id}`;
    const response = await axiosInstance.get(url);

    console.log(
      "get all staff attendance by restaurant API Response:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error("get all staff attendance by restaurant API error:", error);

    if (error.response) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("Network error. Please check your connection.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};
export const getMonthlyStaffAttendance = async (
  id: string,
  startDate?: string | number | Date,
  endDate?: string | number | Date
) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("restaurantId", String(id));
    if (startDate !== undefined)
      queryParams.append("startDate", String(startDate));
    if (endDate !== undefined) queryParams.append("endDate", String(endDate));

    const url = `/attendance/getMonthlyAttendance?${queryParams.toString()}`;
    const response = await axiosInstance.get(url);

    console.log(
      "get all staff attendance by restaurant API Response:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error("get all staff attendance by restaurant API error:", error);

    if (error.response) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("Network error. Please check your connection.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const leaveRequest = async (payload: {
  restaurantId: string;
  fromDate: string; // yyyy-MM-dd
  toDate: string; // yyyy-MM-dd
  reason: string;
  status?: string; // default pending
  file?: File | null;
}) => {
  try {
    const form = new FormData();
    form.append("restaurantId", payload.restaurantId);
    form.append("fromDate", payload.fromDate);
    form.append("toDate", payload.toDate);
    form.append("reason", payload.reason);
    form.append("status", payload.status ?? "pending");
    if (payload.file) {
      form.append("file", payload.file);
    }

    const response = await axiosInstance.post(`/leave/addLeaveRequest`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("leave request API Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("leave request API error:", error);
    if (error.response) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("Network error. Please check your connection.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const updateLeaveRequest = async (payload: {
  id: string;
  restaurantId: string;
  fromDate: string; // yyyy-MM-dd
  toDate: string; // yyyy-MM-dd
  reason: string;
  status: string; // pending | approved | rejected
  file?: File | null;
}) => {
  try {
    const form = new FormData();
    form.append("restaurantId", payload.restaurantId);
    form.append("fromDate", payload.fromDate);
    form.append("toDate", payload.toDate);
    form.append("reason", payload.reason);
    form.append("status", payload.status);
    if (payload.file) {
      form.append("file", payload.file);
    }

    const response = await axiosInstance.put(
      `/leave/updateLeaveRequest?id=${payload.id}`,
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("update leave request API Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("update leave request API error:", error);
    if (error.response) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("Network error. Please check your connection.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// Fetch all leave requests
export const getAllLeaveRequest = async () => {
  try {
    const response = await axiosInstance.get(`/leave/getAllLeaveRequest`);
    console.log("get all leave request API Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("get all leave request API error:", error);
    if (error.response) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("Network error. Please check your connection.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const checkInAttendance = async (payload: FormData) => {
  try {
    const response = await axiosInstance.post(`attendance/check-in`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Check-in API Error:", error);

    if (error.response) {
      throw new Error(
        error.response.data.message || "Error marking attendance"
      );
    } else if (error.request) {
      throw new Error("Network error. Please check your connection.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const getLastAttendance = async (userId: string) => {
  try {
    const response = await axiosInstance.get(
      `attendance/get-last-attendance?uid=${userId}`
    );

    console.log("Get Last Attendance Response:", response.data);

    if (response.data.success && response.data.payload) {
      return response.data.payload;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error("Get Last Attendance API Error:", error);

    if (error.response) {
      throw new Error(
        error.response.data.message || "Error fetching last attendance"
      );
    } else if (error.request) {
      throw new Error("Network error. Please check your connection.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const checkOutAttendance = async (
  attendanceId: string,
  payload: FormData
) => {
  try {
    const response = await axiosInstance.put(
      `attendance/check-out/${attendanceId}`,
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Check-out API Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Check-out API Error:", error);

    if (error.response) {
      throw new Error(
        error.response.data.message || "Error marking attendance"
      );
    } else if (error.request) {
      throw new Error("Network error. Please check your connection.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};
