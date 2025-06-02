import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Profile } from '@/components/ClientApp';
import { supabase } from '@/utils/supabase/client';

export interface UserState {
  profile: Profile | null;
  updating: boolean;
  coolCursor: boolean;
  privacy: boolean;
  jump: boolean;
  voice: boolean;
  web3: boolean;
  foul: boolean;
  window: boolean;
  backseat: boolean;
  time: boolean;

  personality: 'Regular' | 'Petulant' | 'Unintelligible';
  startup: number;

  admin_online: boolean;
}

export const changeTheme = createAsyncThunk(
  'user/changeTheme',
  async ({ id, theme }: { id: string; theme: string }) => {
    const { error } = await supabase
      .from('profiles')
      .update({ theme })
      .eq('id', id);
    if (error) throw error;
    return theme;
  }
);

export const changeName = createAsyncThunk(
  'user/changeName',
  async ({ id, displayname }: { id: string; displayname: string }) => {
    const { error } = await supabase
      .from('profiles')
      .update({ displayname })
      .eq('id', id);
    if (error) throw error;
    return displayname;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    updating: false,
    coolCursor: false,
    privacy: false,
    jump: false,
    voice: false,
    web3: false,
    foul: false,
    window: false,
    backseat: false,
    time: true,
    personality: 'Regular',
    startup: 1,
    admin_online: false,
  } as UserState,
  reducers: {
    setProfile: (state, action) => {
      // Very simple, i just need to dispatch in root page
      state.profile = action.payload;
    },
    toggleCursor: (state, action: PayloadAction<boolean>) => {
      state.coolCursor = action.payload;
    },
    togglePrivacy: (state, action: PayloadAction<boolean>) => {
      state.privacy = action.payload;
    },
    toggleJump: (state, action: PayloadAction<boolean>) => {
      state.jump = action.payload;
    },
    toggleVoice: (state, action: PayloadAction<boolean>) => {
      state.voice = action.payload;
    },
    toggleWeb3: (state, action: PayloadAction<boolean>) => {
      state.web3 = action.payload;
    },
    toggleFoul: (state, action: PayloadAction<boolean>) => {
      state.foul = action.payload;
    },
    toggleWindow: (state, action: PayloadAction<boolean>) => {
      state.window = action.payload;
    },
    toggleBackseat: (state, action: PayloadAction<boolean>) => {
      state.backseat = action.payload;
    },
    toggleTime: (state, action: PayloadAction<boolean>) => {
      state.time = action.payload;
    },
    changePersonality: (
      state,
      action: PayloadAction<'Regular' | 'Petulant' | 'Unintelligible'>
    ) => {
      state.personality = action.payload;
    },
    changeStartup: (state, action: PayloadAction<number>) => {
      state.startup = action.payload;
    },
    toggleAdmin: (state, action: PayloadAction<boolean>) => {
      state.admin_online = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changeTheme.pending, (state) => {
        if (state.profile) {
        }
      })
      .addCase(changeTheme.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.theme = action.payload;
          state.updating = false;
        }
      })
      .addCase(changeName.pending, (state) => {
        if (state.profile) {
          state.updating = true;
        }
      })
      .addCase(changeName.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.displayname = action.payload;
          state.updating = false;
        }
      });
  },
});

export const {
  setProfile,
  toggleCursor,
  toggleBackseat,
  toggleFoul,
  toggleJump,
  togglePrivacy,
  toggleTime,
  toggleVoice,
  toggleWeb3,
  toggleWindow,
  changePersonality,
  changeStartup,
  toggleAdmin,
} = userSlice.actions;

export default userSlice.reducer;
