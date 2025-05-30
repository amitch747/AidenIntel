'use client';
import { useState, useRef } from 'react';
import ToolTipSession from './ToolTipSession';
import { ChatSession } from '@/state/slices/chatSlice';
import { useAppDispatch } from '@/state/hooks';
import { createSession, setRenameId } from '@/state/slices/chatSlice';

interface SessionListProps {
  sessions: ChatSession[];
  currentSessionId: string;
  sessionsLoading: boolean;
  isCreating: boolean;
  deletedId: string;
  renameId: string;
  isRenaming: boolean;
  renameInput: string;
  onSessionSelect: (sessionId: string) => void;
  onCreateSession: () => void;
  isAdminView: boolean;
}

export default function SessionList({
  sessions,
  currentSessionId,
  sessionsLoading,
  isCreating,
  deletedId,
  renameId,
  isRenaming,
  renameInput,
  onSessionSelect,
  isAdminView,
}: SessionListProps) {
  const dispatch = useAppDispatch();
  const listRef = useRef<HTMLDivElement | null>(null);
  const [clickPos, setClickPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleCreateSession = async () => {
    if (isAdminView) return; // Disable for admin

    try {
      const newSession = await dispatch(createSession()).unwrap();
      onSessionSelect(newSession.id);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const sessionOptions = (e: React.MouseEvent, sessionid: string) => {
    if (isAdminView) return; // Disable for admin

    e.preventDefault();
    dispatch(setRenameId(sessionid));
    setClickPos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  if (sessionsLoading) {
    return <div>Loading sessions...</div>;
  }

  return (
    <div ref={listRef} className="flex flex-col items-center relative">
      <button
        className="w95-button"
        onClick={handleCreateSession}
        disabled={isCreating || isAdminView}
      >
        {isCreating ? 'Creating...' : 'New Chat'}
      </button>

      <div className="sessions-list">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSessionSelect(session.id)}
            onContextMenu={(e) => sessionOptions(e, session.id)}
            className={`session-item ${
              deletedId === session.id
                ? 'deleted'
                : renameId === session.id
                ? 'editing'
                : currentSessionId === session.id
                ? 'active'
                : ''
            } ${isAdminView ? 'admin-readonly' : ''}`}
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
      {clickPos && !isAdminView && (
        <ToolTipSession
          left={clickPos.x}
          top={clickPos.y}
          setClickPos={setClickPos}
          renameId={renameId}
          renameInput={renameInput}
          isRenaming={isRenaming}
        />
      )}
    </div>
  );
}
