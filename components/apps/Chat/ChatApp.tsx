'use client';
import SessionList from './SessionList';
import Chat from './Chat';
import { useAdminData } from '@/components/AdminDataContext';
import { useAppSelector, useAppDispatch } from '@/state/hooks';
import { useEffect } from 'react';
import { fetchSessions, setCurrentSession } from '@/state/slices/chatSlice';

export default function ChatApp() {
  const adminData = useAdminData();
  const localChatState = useAppSelector((state) => state.chat);
  const chatState = adminData?.userChatState || localChatState;
  const dispatch = useAppDispatch();

  // Only fetch sessions if NOT in admin view and no sessions loaded
  useEffect(() => {
    if (!adminData?.isAdminView && localChatState.sessionList.length === 0) {
      dispatch(fetchSessions());
    }
  }, [dispatch, adminData?.isAdminView, localChatState.sessionList.length]);

  const handleSessionSelect = (sessionId: string) => {
    if (!adminData?.isAdminView) {
      dispatch(setCurrentSession(sessionId));
    }
  };

  const handleCreateSession = async () => {
    if (!adminData?.isAdminView) {
      // Handle create session logic here or pass to SessionList
    }
  };

  return (
    <div className="chat-interface h-full p-2 pb-6.5 box-border">
      <div className="sessions-panel">
        <SessionList
          sessions={chatState.sessionList}
          currentSessionId={chatState.currentSessionId}
          sessionsLoading={chatState.sessionsLoading}
          isCreating={chatState.isCreating}
          deletedId={chatState.deletedId}
          renameId={chatState.renameId}
          isRenaming={chatState.isRenaming}
          renameInput={chatState.renameInput}
          onSessionSelect={handleSessionSelect}
          onCreateSession={handleCreateSession}
          isAdminView={adminData?.isAdminView || false}
        />
      </div>
      <div className="chat-panel">
        <Chat
          currentSessionId={chatState.currentSessionId}
          messages={chatState.messages}
          userInput={chatState.userInput}
          chatLoading={chatState.chatLoading}
          isSending={chatState.isSending}
          isAdminView={adminData?.isAdminView || false}
        />
      </div>
    </div>
  );
}
