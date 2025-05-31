'use client';
import { ChatMessage } from '@/state/slices/chatSlice';

interface AdminChatProps {
  currentSessionId: string;
  messages: { [sessionId: string]: ChatMessage[] };
  userInput: string;
  chatLoading: boolean;
  isSending: boolean;
}

export default function AdminChat({
  currentSessionId,
  messages,
  userInput,
  chatLoading,
  isSending,
}: AdminChatProps) {
  const currentMessages = messages[currentSessionId] || [];

  if (!currentSessionId) {
    return <div>User has no chat session selected</div>;
  }
  if (chatLoading) {
    return <div>Loading messages</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4 p-4">
          {currentMessages.map((message: ChatMessage) => (
            <div key={message.id} className="p-2">
              <strong>{message.is_admin ? 'Admin' : 'User'}:</strong>{' '}
              {message.content}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 p-4 border-t bg-[#c0c0c0]">
        <input
          type="text"
          value={userInput}
          readOnly
          placeholder="User's input (read-only)"
          className="w95-input flex-1 admin-readonly"
          style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
        />
        <button disabled={true} className="w95-button" style={{ opacity: 0.6 }}>
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
