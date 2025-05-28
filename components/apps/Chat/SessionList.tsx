'use client';
import { useState, useRef } from 'react';
import ToolTipSession from './ToolTipSession';
import {
  fetchSessions,
  setCurrentSession,
  createSession,
  setRenameId,
} from '@/state/slices/chatSlice';
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/state/hooks';

export default function SessionList() {
  const dispatch = useAppDispatch();
  const {
    sessionList,
    currentSessionId,
    sessionsLoading,
    isCreating,
    deletedId,
    renameId,
    isRenaming,
    renameInput,
  } = useAppSelector((state) => state.chat);

  const listRef = useRef<HTMLDivElement | null>(null);
  //const [createSession, { isLoading: isCreating }] = useCreateSessionMutation();
  const [clickPos, setClickPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  const handleCreateSession = async () => {
    try {
      const newSession = await dispatch(createSession()).unwrap();
      dispatch(setCurrentSession(newSession.id));
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const sessionOptions = (e: React.MouseEvent, sessionid: string) => {
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
        className="w95-button "
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
      {clickPos && (
        <ToolTipSession
          left={clickPos.x}
          top={clickPos.y}
          setClickPos={setClickPos}
        />
      )}
    </div>
  );
}
