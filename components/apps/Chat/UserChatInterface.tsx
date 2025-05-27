// components/apps/chat/UserChatInterface.tsx
'use client';
import { useState } from 'react';
import SessionList from './SessionList';
import Chat from './Chat';

export default function UserChatInterface() {
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  return (
    <div className="chat-interface">
      <div className="sessions-panel">
        <SessionList
          currentSessionId={currentSessionId}
          onSessionSelect={setCurrentSessionId}
        />
      </div>
      <div className="chat-panel">
        <Chat session_id={currentSessionId} />
      </div>
    </div>
  );
}
