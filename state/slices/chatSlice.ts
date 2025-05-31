import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/utils/supabase/client';

export interface ChatMessage {
  id: string;
  session_id: string;
  is_admin: boolean;
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  created_at: string;
  last_message_at: string;
  title: string;
}

export interface ChatState {
  sessionList: ChatSession[];
  currentSessionId: string;
  sessionsLoading: boolean;
  deletedId: string;
  isCreating: boolean;
  renameInput: string;
  renameId: string;
  isRenaming: boolean;

  messages: { [sessionId: string]: ChatMessage[] };
  userInput: string;
  adminInput: string;
  chatLoading: boolean;
  isSending: boolean;
  toolTip: { left: number; top: number } | null;
}

const initialState: ChatState = {
  sessionList: [],
  currentSessionId: '',
  messages: {},
  userInput: '',
  adminInput: '',
  chatLoading: false,
  sessionsLoading: false,
  deletedId: '',
  isCreating: false,

  renameInput: '',
  renameId: '',
  isRenaming: false,
  isSending: false,
  toolTip: null,
};

export const fetchSessions = createAsyncThunk(
  'chat/fetchSessions',
  async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    return sessions || [];
  }
);

export const createSession = createAsyncThunk(
  'chat/createSession',
  async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data: newSession, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: user.id,
        title: 'New Chat',
      })
      .select('*')
      .single();

    if (error) throw error;
    return newSession;
  }
);

export const renameSession = createAsyncThunk(
  'chat/renameSession',
  async ({ id, title }: { id: string; title: string }) => {
    // this probably is not needed everytime
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data: updatedSession, error } = await supabase
      .from('chat_sessions')
      .update({ title })
      .eq('id', id)
      .select('*') // return the updated row
      .single();

    if (error) throw error;
    return updatedSession;
  }
);

export const deleteSession = createAsyncThunk(
  'chat/deleteSession',
  async (sessionId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;

    return sessionId; // Return the deleted session ID
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (sessionId: string) => {
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    return { sessionId, messages: messages || [] };
  }
);

export const postMessage = createAsyncThunk(
  'chat/postMessage',
  async ({
    sessionId,
    message,
    isAdmin,
  }: {
    sessionId: string;
    message: string;
    isAdmin: boolean;
  }) => {
    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert({
        content: message,
        is_admin: isAdmin,
        session_id: sessionId,
      })
      .select()
      .single();

    if (error) throw error;

    // Update session timestamp
    await supabase
      .from('chat_sessions')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', sessionId);

    return { sessionId, newMessage };
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentSession: (state, action: PayloadAction<string>) => {
      state.currentSessionId = action.payload;
    },
    updateUserInput: (state, action: PayloadAction<string>) => {
      state.userInput = action.payload;
    },
    updateRenameInput: (state, action: PayloadAction<string>) => {
      state.renameInput = action.payload;
    },
    setIsRenaming: (state, action: PayloadAction<boolean>) => {
      state.isRenaming = action.payload;
    },
    setRenameId: (state, action: PayloadAction<string>) => {
      state.renameId = action.payload;
    },
    setToolTip: (
      state,
      action: PayloadAction<{ left: number; top: number } | null>
    ) => {
      state.toolTip = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchSessions.pending, (state) => {
        state.sessionsLoading = true;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.sessionList = action.payload;
        state.sessionsLoading = false;
      })

      .addCase(deleteSession.pending, (state, action) => {
        state.deletedId = action.meta.arg; // wtf
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.sessionList = state.sessionList.filter(
          (session) => session.id !== action.payload
        );
        state.deletedId = '';
        state.currentSessionId = '';
      })

      .addCase(createSession.pending, (state, action) => {
        state.isCreating = true;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.sessionList.unshift(action.payload);
        state.isCreating = false;
      })

      .addCase(renameSession.pending, (state, action) => {
        state.renameId = action.meta.arg.id;
      })
      .addCase(renameSession.fulfilled, (state, action) => {
        //https://stackoverflow.com/questions/4689856/how-to-change-value-of-object-which-is-inside-an-array-using-javascript-or-jquer
        const sessionIndex = state.sessionList.findIndex(
          (session) => session.id === action.payload.id
        );
        if (sessionIndex !== -1) {
          state.sessionList[sessionIndex].title = action.payload.title;
        }
        state.renameId = '';
      })

      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages[action.payload.sessionId] = action.payload.messages;
      })
      .addCase(postMessage.pending, (state) => {
        state.isSending = true;
      })
      .addCase(postMessage.fulfilled, (state, action) => {
        if (!state.messages[action.payload.sessionId]) {
          state.messages[action.payload.sessionId] = [];
        }
        state.messages[action.payload.sessionId].push(
          action.payload.newMessage
        );
        state.isSending = false;
        state.userInput = '';
      })
      .addCase(postMessage.rejected, (state) => {
        state.isSending = false;
      });
  },
});

export const {
  setCurrentSession,
  updateUserInput,
  updateRenameInput,
  setIsRenaming,
  setRenameId,
  setToolTip,
} = chatSlice.actions;

export default chatSlice.reducer;
