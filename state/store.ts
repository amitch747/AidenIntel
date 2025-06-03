// state/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import desktopReducer from '@/state/slices/desktopSlice';
import userReducer from '@/state/slices/userSlice';
import chatReducer from '@/state/slices/chatSlice';

import storage from 'redux-persist/lib/storage';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

/* 👇 keep only the lightweight prefs */
const userPersistConfig = {
  key: 'userPrefs',
  storage,
  whitelist: [
    'coolCursor',
    'privacy',
    'jump',
    'voice',
    'web3',
    'foul',
    'window',
    'backseat',
    'time',
    'personality',
    'startup',
  ],
};

const rootReducer = combineReducers({
  desktop: desktopReducer,
  user: persistReducer(userPersistConfig, userReducer),
  chat: chatReducer,
});

/* 🛠  serialisable‑check must ignore redux‑persist actions */
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

/* ——— types ——— */
export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
