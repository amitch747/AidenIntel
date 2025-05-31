'use client';
import AdminSessionList from './AdminSessionList';
import AdminChat from './AdminChat';
import { ChatState } from '@/state/slices/chatSlice';

export default function AdminChatApp({
  userChatState,
}: {
  userChatState: ChatState;
}) {
  return (
    <div className="chat-interface h-full p-2 pb-6.5 box-border">
      <div className="sessions-panel">
        <AdminSessionList
          sessions={userChatState.sessionList}
          currentSessionId={userChatState.currentSessionId}
          sessionsLoading={userChatState.sessionsLoading}
          isCreating={userChatState.isCreating}
          deletedId={userChatState.deletedId}
          renameId={userChatState.renameId}
          isRenaming={userChatState.isRenaming}
          renameInput={userChatState.renameInput}
          toolTip={userChatState.toolTip}
        />
      </div>
      <div className="chat-panel">
        <AdminChat
          currentSessionId={userChatState.currentSessionId}
          messages={userChatState.messages}
          userInput={userChatState.userInput}
          chatLoading={userChatState.chatLoading}
          isSending={userChatState.isSending}
        />
      </div>
    </div>
  );
}
