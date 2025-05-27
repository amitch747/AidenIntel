'use client';
import { useAppSelector } from '@/state/hooks';
import AdminChatInterface from './AdminChatInterface';
import UserChatInterface from './UserChatInterface';

export default function ChatApp() {
  const profile = useAppSelector((state) => state.user.profile)!;

  return (
    <div className="chat-app">
      {profile.is_admin ? <AdminChatInterface /> : <UserChatInterface />}
    </div>
  );
}
