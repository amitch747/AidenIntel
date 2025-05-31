'use client';
import SessionList from './SessionList';
import Chat from './Chat';

export default function ChatApp() {
  return (
    <div className="chat-interface h-full p-2 pb-6.5 pt-0">
      <div className="sessions-panel">
        <SessionList />
      </div>
      <div className="chat-panel">
        <Chat />
      </div>
    </div>
  );
}
