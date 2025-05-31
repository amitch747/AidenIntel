'use client';

import { ChatSession } from '@/state/slices/chatSlice';
import AdminToolTipSession from './AdminToolTipSession';

interface AdminSessionListProps {
  sessions: ChatSession[];
  currentSessionId: string;
  sessionsLoading: boolean;
  isCreating: boolean;
  deletedId: string;
  renameId: string;
  isRenaming: boolean;
  renameInput: string;
  toolTip: { left: number; top: number } | null;
}

export default function AdminSessionList({
  sessions,
  currentSessionId,
  sessionsLoading,
  isCreating,
  deletedId,
  renameId,
  isRenaming,
  renameInput,
  toolTip,
}: AdminSessionListProps) {
  if (sessionsLoading) {
    return <div>Loading sessions...</div>;
  }

  return (
    <div className="flex flex-col items-center relative">
      <button className="w95-button" disabled={true} style={{ opacity: 0.6 }}>
        {isCreating ? 'Creating...' : 'New Chat'}
      </button>

      <div className="sessions-list">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`session-item admin-readonly ${
              deletedId === session.id
                ? 'deleted'
                : renameId === session.id
                ? 'editing'
                : currentSessionId === session.id
                ? 'active'
                : ''
            }`}
          >
            <h4>
              {renameId === session.id && isRenaming
                ? renameInput
                : session.title}
            </h4>
            <small>
              {new Date(session.last_message_at).toLocaleDateString()}
            </small>
          </div>
        ))}
      </div>
      {toolTip && (
        <AdminToolTipSession
          toolTip={toolTip}
          isRenaming={isRenaming}
          renameInput={renameInput}
        />
      )}
    </div>
  );
}
