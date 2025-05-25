import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import ChatApp from '@/components/apps/ChatApp';

export interface WindowState {
  id: string;
  title: string;
  appName: string;
  zIndex: number;
  isOpen: boolean;
  isMaximized: boolean;
  isMinimized: boolean;
  position: { x: number; y: number; w: number; h: number };
  prevPosition?: { x: number; y: number; w: number; h: number };
  minDim: { xM: number; yM: number };
}

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const initialState: WindowState[] = [
  {
    id: '1',
    title: 'AidenIntelligence',
    appName: 'ChatApp',
    zIndex: 0,
    isOpen: false,
    isMaximized: false,
    isMinimized: false,
    //Math.random() * (max - min) + min;
    position: {
      x: getRandomArbitrary(100, 200),
      y: getRandomArbitrary(100, 200),
      w: 200,
      h: 150,
    },
    minDim: { xM: 200, yM: 150 },
  },
  {
    id: '2',
    title: 'Settings',

    appName: 'SettingsApp',
    zIndex: 0,
    isOpen: false,
    isMaximized: false,
    isMinimized: false,
    position: {
      x: getRandomArbitrary(100, 200),
      y: getRandomArbitrary(100, 200),
      w: 250,
      h: 200,
    },
    minDim: { xM: 250, yM: 200 },
  },
  {
    id: '3',
    title: 'Music',

    appName: 'MusicApp',
    zIndex: 0,
    isOpen: false,
    isMaximized: false,
    isMinimized: false,
    position: {
      x: getRandomArbitrary(100, 200),
      y: getRandomArbitrary(100, 200),
      w: 200,
      h: 415,
    },
    minDim: { xM: 200, yM: 415 },
  },
];

const desktopSlice = createSlice({
  name: 'windows',
  initialState,
  reducers: {
    openWindow: (state, action: PayloadAction<string>) => {
      const window = state.find((w) => w.id === action.payload);
      if (window) {
        if (window) {
          window.isOpen = true;
          window.isMinimized = false;
          window.zIndex = Math.max(...state.map((w) => w.zIndex)) + 1;
        }
      }
    },
    closeWindow: (state, action: PayloadAction<string>) => {
      const window = state.find((w) => w.id === action.payload);
      if (window) {
        window.isOpen = false;
      }
    },
    toggleView: (state, action: PayloadAction<string>) => {
      const window = state.find((w) => w.id === action.payload);
      if (window) {
        window.isMinimized = !window.isMinimized;
      }
    },
    toggleMax: (state, action: PayloadAction<string>) => {
      const window = state.find((w) => w.id === action.payload);
      if (window) {
        if (window.isMaximized) {
          if (window.prevPosition) {
            window.position = { ...window.prevPosition };
            window.prevPosition = undefined;
          }
          window.isMaximized = false;
        } else {
          window.prevPosition = { ...window.position };
          window.isMaximized = true;
        }
      }
    },
    bringToFront: (state, action: PayloadAction<string>) => {
      const window = state.find((w) => w.id === action.payload);
      if (window) {
        window.zIndex = Math.max(...state.map((w) => w.zIndex)) + 1;
      }
    },
    updateWindowBounds: (
      state,
      action: PayloadAction<{
        id: string;
        position?: { x: number; y: number };
        size?: { w: number; h: number };
      }>
    ) => {
      const window = state.find((w) => w.id === action.payload.id);
      if (window) {
        if (action.payload.position) {
          window.position.x = action.payload.position.x;
          window.position.y = action.payload.position.y;
        }
        if (action.payload.size) {
          window.position.w = action.payload.size.w;
          window.position.h = action.payload.size.h;
        }
      }
    },
  },
});

export const {
  openWindow,
  closeWindow,
  toggleView,
  toggleMax,
  bringToFront,
  updateWindowBounds,
} = desktopSlice.actions;

export default desktopSlice.reducer;
