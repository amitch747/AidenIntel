import { createSlice } from '@reduxjs/toolkit';

interface UserState {
  profile: {
    id: string;
    displayname?: string;
    theme: string;
    is_admin: boolean;
  } | null;
}

const userSlice = createSlice({
  name: 'user',
  initialState: { profile: null } as UserState,
  reducers: {
    setProfile: (state, action) => {
      // Very simple, i just need to dispatch in root page
      state.profile = action.payload;
    },
  },
});

export const { setProfile } = userSlice.actions;

export default userSlice.reducer;
