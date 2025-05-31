'use client';
import { useState, useRef } from 'react';
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
    <div className="flex flex-col items-center relative">
      <button
        className="w95-button"
        onClick={handleCreateSession}
        disabled={isCreating}
      >
        {isCreating ? 'Creating...' : 'New Chat'}
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
      {toolTip && <ToolTipSession />}
    </div>
  );
}
