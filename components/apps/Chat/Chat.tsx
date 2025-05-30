'use client';
import { useEffect } from 'react';
import { ChatMessage } from '@/state/slices/chatSlice';
import { useAppDispatch } from '@/state/hooks';
import {
  updateUserInput,
  fetchMessages,
  postMessage,
} from '@/state/slices/chatSlice';

interface ChatProps {
  currentSessionId: string;
  messages: { [sessionId: string]: ChatMessage[] };
  userInput: string;
  chatLoading: boolean;
  isSending: boolean;
  isAdminView: boolean;
}

export default function Chat({
  currentSessionId,
  messages,
  userInput,
  chatLoading,
  isSending,
  isAdminView,
}: ChatProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isAdminView && currentSessionId && !messages[currentSessionId]) {
      dispatch(fetchMessages(currentSessionId));
    }
  }, [currentSessionId, messages, dispatch, isAdminView]);

  const currentMessages = messages[currentSessionId] || [];

  if (!currentSessionId) {
    return <div>Select a chat session to start messaging</div>;
  }
  if (chatLoading) {
    return <div>Loading messages</div>;
  }

  const handleSend = async () => {
    if (isAdminView || !userInput.trim()) return;

    try {
      await dispatch(
        postMessage({
          sessionId: currentSessionId,
          message: userInput,
          isAdmin: false,
        })
      ).unwrap();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleInputChange = (value: string) => {
    if (!isAdminView) {
      dispatch(updateUserInput(value));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4 p-4">
          {currentMessages.map((message: ChatMessage) => (
            <div key={message.id} className="p-2">
              {message.content}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 p-4 border-t bg-[#c0c0c0]">
        <input
          type="text"
          value={userInput}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Say something..."
          disabled={isSending || isAdminView}
          className={`w95-input flex-1 ${isAdminView ? 'admin-readonly' : ''}`}
        />
        <button
          onClick={handleSend}
          disabled={isSending || isAdminView}
          className="w95-button"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
