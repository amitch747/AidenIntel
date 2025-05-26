import { configureStore } from '@reduxjs/toolkit';
import desktopReducer from '@/state/slices/desktopSlice';
import userReducer from '@/state/slices/userSlice';
export const store = configureStore({
  reducer: {
    desktop: desktopReducer,
    user: userReducer,
  },
});

// Infer the type of `store`
export type AppStore = typeof store;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch;
// Same for the `RootState` type
export type RootState = ReturnType<typeof store.getState>;
