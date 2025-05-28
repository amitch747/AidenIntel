'use client';
import { useEffect } from 'react';
import { ChatMessage } from '@/state/slices/chatSlice';
import { useAppSelector, useAppDispatch } from '@/state/hooks';
import {
  updateUserInput,
  fetchMessages,
  postMessage,
} from '@/state/slices/chatSlice';

export default function Chat() {
  const dispatch = useAppDispatch();
  const { currentSessionId, chatLoading, messages, userInput, isSending } =
    useAppSelector((state) => state.chat);

  useEffect(() => {
    if (currentSessionId && !messages[currentSessionId]) {
      dispatch(fetchMessages(currentSessionId));
    }
  }, [currentSessionId, messages, dispatch]);
  const currentMessages = messages[currentSessionId] || [];

  if (!currentSessionId) {
    return <div>Select a chat session to start messaging</div>;
  }
  if (chatLoading) {
    return <div>Loading messages</div>;
  }

  const handleSend = async () => {
    if (!userInput.trim()) return;
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
          onChange={(e) => dispatch(updateUserInput(e.target.value))}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Say something..."
          disabled={isSending}
          className="w95-input flex-1"
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
