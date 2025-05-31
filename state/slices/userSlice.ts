import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Profile } from '@/components/ClientApp';
import { supabase } from '@/utils/supabase/client';

export interface UserState {
  profile: Profile | null;
  updating: boolean;
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
  initialState: { profile: null } as UserState,
  reducers: {
    setProfile: (state, action) => {
      // Very simple, i just need to dispatch in root page
      state.profile = action.payload;
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

export const { setProfile } = userSlice.actions;

export default userSlice.reducer;
