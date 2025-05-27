'use client';
import {
  useGetMessagesQuery,
  useSendMessageMutation,
} from '@/state/api/chatApi';
import { ChatMessage } from '@/state/api/chatApi';
import { useState } from 'react';

interface ChatProps {
  session_id: string;
}

export default function Chat({ session_id }: ChatProps) {
  const [messageText, setMessageText] = useState('');
  const { data: messages = [], isLoading } = useGetMessagesQuery(session_id, {
    skip: !session_id, // Skip query if no sessionId
  });
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  if (!session_id) {
    return <div>Select a chat session to start messaging</div>;
  }

  if (isLoading) {
    return <div>Loading messages</div>;
  }

  const handleSend = async () => {
    if (!messageText.trim()) return;
    // send message logic
    try {
      await sendMessage({
        content: messageText,
        is_admin: false, // User sending message
        session_id: session_id, // You might need to modify your mutation to accept this
      }).unwrap();

      setMessageText(''); // Clear input on success
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        {messages.map((message: ChatMessage) => (
          <div key={message.id} className="p-2">
            {message.content}
          </div>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Say something..."
          disabled={isSending}
        />
        <button
          onClick={handleSend}
          disabled={isSending}
          className="w95-button"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
