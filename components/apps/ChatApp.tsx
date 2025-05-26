'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useAppSelector } from '@/state/hooks';

interface Message {
  content: string;
  sender: string;
  timestamp: string;
}

// Need ability to swap channels (sessions)
// These sessions will be RTK query
// So update query right away, then async update db?
// Pull from db (through query so we cache it) when user clicks new session (or just opens app)

export default function ChatApp() {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const profile = useAppSelector((state) => state.user.profile);

  useEffect(() => {
    const channel = supabase.channel('chat-room');

    channel
      .on('broadcast', { event: 'message' }, (payload) => {
        setMessages((prev) => [...prev, payload.payload]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSend = () => {
    if (!messageText.trim()) return;

    const message = {
      content: messageText,
      sender: profile?.displayname || 'User',
      timestamp: new Date().toISOString(),
    };

    supabase.channel('chat-room').send({
      type: 'broadcast',
      event: 'message',
      payload: message,
    });

    setMessageText('');
  };

  return (
    <div className="chat-app">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
