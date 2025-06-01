'use client';
import ToolTipSession from './ToolTipSession';
import {
  fetchSessions,
  setCurrentSession,
  createSession,
  setRenameId,
  setToolTip,
} from '@/state/slices/chatSlice';
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/state/hooks';

export default function SessionList() {
  const {
    sessionList,
    currentSessionId,
    sessionsLoading,
    isCreating,
    deletedId,
    renameId,
    isRenaming,
    renameInput,
    toolTip,
  } = useAppSelector((state) => state.chat);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Get sessions on mount
    dispatch(fetchSessions());
  }, [dispatch]);

  const handleCreateSession = async () => {
    try {
      // Unwrap seems to be needed when dealing with promises. Look into
      const newSession = await dispatch(createSession()).unwrap();
      dispatch(setCurrentSession(newSession.id));
    } catch (error) {
      console.error('Session creation failed - ', error);
    }
  };

  const sessionOptions = (e: React.MouseEvent, sessionid: string) => {
    e.preventDefault();
    dispatch(setRenameId(sessionid));
    dispatch(setToolTip({ left: e.clientX, top: e.clientY }));
  };

  if (sessionsLoading) {
    return <div>Looking for sessions...</div>;
  }

  return (
    <div className="flex flex-col items-center relative pt-1">
      <button
        className="w95-button w-full not-only:justify-center"
        onClick={handleCreateSession}
        disabled={isCreating || sessionList.length > 2}
      >
        {isCreating
          ? 'Creating...'
          : sessionList.length > 2
          ? '3/3 Sessions'
          : 'New Session'}
      </button>

      <div className="sessions-list">
        {sessionList.map((session) => (
          <div
            key={session.id}
            onClick={() => dispatch(setCurrentSession(session.id))}
            onContextMenu={(e) => sessionOptions(e, session.id)}
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
      {toolTip && <ToolTipSession />}
    </div>
  );
}
