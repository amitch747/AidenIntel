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
    <div className="flex flex-col items-center relative pt-1">
      <button
        className="w95-button w-full not-only:justify-center"
        disabled={isCreating || sessions.length > 2}
      >
        {isCreating
          ? 'Creating...'
          : sessions.length > 2
          ? '3/3 Sessions'
          : 'New Session'}
      </button>

      <div className="sessions-list">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`session-item ${
              deletedId === session.id
                ? 'deleted'
                : renameId === session.id
                ? 'editing'
                : currentSessionId === session.id
                ? 'active'
                : ''
            }`}
          >
            <h4 style={{ minHeight: '1.5em' }}>
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
          isRenaming={isRenaming}
          toolTip={toolTip}
          renameInput={renameInput}
        />
      )}
    </div>
  );
}
