import { RestaurantData } from "@/api/restaurant.api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Slice state type
type RestaurantState = {
    count: number;
    data: RestaurantData[];
};

// Initial state
const initialState: RestaurantState = {
    count: 0,
    data: [],
};

// const restaurantSlice = createSlice({
//   name: "restaurant",
//   initialState,
//   reducers: {
//     // Set all restaurants
//     setRestaurants: (state, action: PayloadAction<RestaurantData[]>) => {
//       state.restaurants = action.payload;
//     },
//     // Clear all restaurants
//     clearRestaurants: (state) => {
//       state.restaurants = [];
//     },
//   },
// });

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState,
  reducers: {
    // Set all restaurants with count and data
    setRestaurants: (state, action: PayloadAction<{ count: number; data: RestaurantData[] }>) => {
      state.count = action.payload.count;
      state.data = action.payload.data;
    },
    // Clear all restaurants
    clearRestaurants: (state) => {
      state.count = 0;
      state.data = [];
    },
  },
});
// import { RestaurantData } from "@/api/restaurant.api";
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// const initialState: RestaurantData[] = []; // state is directly an array

// const restaurantSlice = createSlice({
//   name: "restaurant",
//   initialState,
//   reducers: {
//     setRestaurants: (_, action: PayloadAction<RestaurantData[]>) => {
//       return action.payload; // overwrite with new array
//     },
//     clearRestaurants: () => {
//       return []; // reset to empty array
//     },
//   },
// });

export const { setRestaurants, clearRestaurants } = restaurantSlice.actions;
export default restaurantSlice.reducer;
