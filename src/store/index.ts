import { configureStore } from "@reduxjs/toolkit";
import restaurantReducer from "./slices/restaurentSlice";

export const store = configureStore({
  reducer: {
    restaurant: restaurantReducer, // add more slices here
  },
});

// Types for usage in app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
