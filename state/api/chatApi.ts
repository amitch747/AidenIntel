// Lots to say about this
// the supabaseBaseQuery function 'tricks' RTK query into thinking we're doing HTTP requests on certain routes
// instead is just a direct call to

import { createApi } from '@reduxjs/toolkit/query/react';
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

// Custom base query for Supabase
const supabaseBaseQuery = async ({
  url,
  method,
  body,
}: {
  url: string;
  method: string;
  body?: any;
}) => {
  try {
    switch (method) {
      case 'GET':
        if (url === 'sessions') {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          const { data: sessions } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });
          return { data: sessions || [] };
        }

        if (url === 'messages') {
          const {
            data: { user },
            // I may want to change this, we already have access to the profile in RTK
          } = await supabase.auth.getUser();
          if (!user) throw new Error('No authenticated user');

          const sessionId = body;
          // Get messages for selected session
          const { data: messages, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

          if (error) throw error;
          return { data: messages || [] };
        }
        break;

      case 'POST':
        if (url === 'sessions') {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) throw new Error('No authenticated user');

          const { data: newSession, error: sessionError } = await supabase
            .from('chat_sessions')
            .insert({
              user_id: user.id,
              title: body.title || 'New Chat', // Use provided title or default
            })
            .select('*') // Select all fields, not just id
            .single();

          if (sessionError) throw sessionError;

          return { data: newSession }; // Don't forget to return!
        }

        if (url === 'messages') {
          // Get current user
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('No authenticated user');

          // Insert message
          // content: string;
          // is_admin: boolean;
          // sessionId: string;
          const { data: message, error } = await supabase
            .from('chat_messages')
            .insert({
              content: body.content,
              is_admin: body.is_admin,
              session_id: body.session_id,
            })
            .select()
            .single();

          if (error) throw error;

          // Update session timestamp
          await supabase
            .from('chat_sessions')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', body.session_id);

          return { data: message };
        }
        break;
    }

    throw new Error(`Unhandled request: ${method} ${url}`);
  } catch (error: any) {
    return {
      error: {
        // MUST be shaped like this
        status: 'CHATAPI_ERROR',
        error: error.message || 'Unknown chatAPI error',
      },
    };
  }
};

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: supabaseBaseQuery,
  tagTypes: ['Messages', 'Sessions'],
  endpoints: (builder) => ({
    getMessages: builder.query<ChatMessage[], string>({
      query: (sessionId) => ({
        url: 'messages',
        method: 'GET',
        body: sessionId,
      }),
      providesTags: ['Messages'],
    }),
    sendMessage: builder.mutation<
      ChatMessage,
      {
        content: string;
        is_admin: boolean;
        session_id: string;
      }
    >({
      query: (messageData) => ({
        url: 'messages',
        method: 'POST',
        body: messageData,
      }),
      // POST query provides info to tag and invalidates cache
      invalidatesTags: ['Messages'],
    }),
    getSessions: builder.query<ChatSession[], void>({
      query: () => ({ url: 'sessions', method: 'GET' }),
      providesTags: ['Sessions'],
    }),
    createSession: builder.mutation<ChatSession, { title: string }>({
      query: (sessionData) => ({
        url: 'sessions',
        method: 'POST',
        body: sessionData,
      }),
      invalidatesTags: ['Sessions'],
    }),
  }),
});

export const {
  useGetSessionsQuery,
  useCreateSessionMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
} = chatApi;
