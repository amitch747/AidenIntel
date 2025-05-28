import { configureStore } from '@reduxjs/toolkit';
import desktopReducer from '@/state/slices/desktopSlice';
import userReducer from '@/state/slices/userSlice';
import chatReducer from '@/state/slices/chatSlice';
import { chatApi } from './api/chatApi';

export const store = configureStore({
  reducer: {
    desktop: desktopReducer,
    user: userReducer,
    chat: chatReducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(chatApi.middleware),
});

// Infer the type of `store`
export type AppStore = typeof store;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch;
// Same for the `RootState` type
export type RootState = ReturnType<typeof store.getState>;
