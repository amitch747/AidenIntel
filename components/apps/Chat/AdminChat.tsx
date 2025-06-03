'use client';
import { ChatMessage } from '@/state/slices/chatSlice';
import { useState, useEffect, useRef } from 'react';
interface AdminChatProps {
  currentSessionId: string;
  messages: { [sessionId: string]: ChatMessage[] };
  userInput: string;
  chatLoading: boolean;
  isSending: boolean;
  thinking: boolean;
}

const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 30);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return <span>{displayedText}</span>;
};

export default function AdminChat({
  currentSessionId,
  messages,
  userInput,
  chatLoading,
  isSending,
  thinking,
}: AdminChatProps) {
  const currentMessages = messages[currentSessionId] || [];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollTop =
            messagesEndRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, thinking]);

  if (!currentSessionId) {
    return <div>User has no chat session selected</div>;
  }
  if (chatLoading) {
    return <div>Loading messages</div>;
  }
  const latestMessage = currentMessages[currentMessages.length - 1];

  return (
    <div className="flex flex-col h-full w95-box-shadow">
      <div className="flex-1 overflow-y-auto p-4" ref={messagesEndRef}>
        <div className="flex flex-col gap-2">
          {currentMessages.map((message: ChatMessage) => {
            const isLatestAdminMessage =
              message.is_admin && message.id === latestMessage?.id;

            return (
              <div
                key={message.id}
                className={`flex ${
                  message.is_admin ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`p-1 pl-3 pr-3 inline-block ${
                    message.is_admin
                      ? message.is_header
                        ? 'text-black text-4xl pb-0 w-full rounded-lg'
                        : 'text-black w-full '
                      : 'bg-[#008080] text-white max-w-[70%]'
                  }`}
                  style={{
                    minHeight: 'auto',
                    height: 'fit-content',
                    wordWrap: 'break-word',
                  }}
                >
                  {isLatestAdminMessage ? (
                    <TypewriterText text={message.content} />
                  ) : (
                    message.content
                  )}
                  {message.is_header ? <hr /> : <></>}
                </div>
              </div>
            );
          })}
          {thinking && (
            <div className="flex justify-start transition-all duration-300 ease-in-out">
              <div
                className="p-3 inline-block max-w-[70%] text-black rounded-lg"
                style={{
                  backgroundColor: '#c0c0c0',
                }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-black animate-bounce"></span>
                  <span
                    className="w-2 h-2 bg-black animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-black animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 p-4">
        <input
          type="text"
          value={userInput}
          placeholder="Say something..."
          disabled={isSending}
          className="w95-input flex-1"
          readOnly
        />
        <button
          disabled={isSending}
          className="w95-button h-[35px] w-[50px] items-center justify-center"
        >
          {isSending ? 'Sending' : 'Send'}
        </button>
      </div>
    </div>
  );
}
