// Lots to say about this
// the supabaseBaseQuery function 'tricks' RTK query into thinking we're doing HTTP requests on certain routes
// instead is just a direct call to

import { createApi } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/utils/supabase/client';

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: 'user' | 'admin';
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  created_at: string;
  last_message_at: string;
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
        if (url === 'messages') {
          const {
            data: { user },
            // I may want to change this, we already have access to the profile in RTK
          } = await supabase.auth.getUser();
          if (!user) throw new Error('No authenticated user');

          // Find user's session
          const { data: session } = await supabase
            .from('chat_sessions')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (!session) {
            return { data: [] }; // No session = no messages
          }

          // Get messages for this session
          const { data: messages, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', session.id)
            .order('created_at', { ascending: true });

          if (error) throw error;
          return { data: messages || [] };
        }
        break;

      case 'POST':
        if (url === 'messages') {
          // Get current user
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('No authenticated user');

          // Find or create session
          let { data: session } = await supabase
            .from('chat_sessions')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (!session) {
            // Create new session
            const { data: newSession, error: sessionError } = await supabase
              .from('chat_sessions')
              .insert({ user_id: user.id })
              .select('id')
              .single();

            if (sessionError) throw sessionError;
            session = newSession;
          }

          // Insert message
          const { data: message, error } = await supabase
            .from('chat_messages')
            .insert({
              session_id: session.id,
              sender_type: body.sender_type,
              content: body.content,
            })
            .select()
            .single();

          if (error) throw error;

          // Update session timestamp
          await supabase
            .from('chat_sessions')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', session.id);

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

// Create the API slice
export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: supabaseBaseQuery,
  tagTypes: ['Messages'],
  endpoints: (builder) => ({
    // Get messages for current user's session
    getMessages: builder.query<ChatMessage[], void>({
      query: () => ({
        url: 'messages',
        method: 'GET',
      }),
      // GET query updates messages cache if invalidated by POST
      providesTags: ['Messages'],
    }),

    // Send a new message
    sendMessage: builder.mutation<
      ChatMessage,
      {
        content: string;
        sender_type: 'user' | 'admin';
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
  }),
});

// Export hooks for usage in functional components
export const { useGetMessagesQuery, useSendMessageMutation } = chatApi;
