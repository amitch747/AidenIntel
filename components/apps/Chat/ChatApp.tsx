'use client';
import { useAppSelector } from '@/state/hooks';
import UserChatInterface from './UserChatInterface';

export default function ChatApp() {
  const profile = useAppSelector((state) => state.user.profile)!;

  return (
    <div className="chat-app">
      <UserChatInterface />
    </div>
  );
}
