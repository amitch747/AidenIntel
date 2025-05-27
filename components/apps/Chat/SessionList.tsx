'use cient';

import {
  useGetSessionsQuery,
  useCreateSessionMutation,
} from '@/state/api/chatApi';

interface SessionListProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
}

export default function SessionList({
  currentSessionId,
  onSessionSelect,
}: SessionListProps) {
  const { data: sessions = [], isLoading } = useGetSessionsQuery();
  const [createSession, { isLoading: isCreating }] = useCreateSessionMutation();

  const handleCreateSession = async () => {
    try {
      const newSession = await createSession({ title: 'New Chat' }).unwrap();
      onSessionSelect(newSession.id);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  return (
    <div>
      <button className="w95-button" onClick={handleCreateSession}>
        {isCreating ? 'Creating...' : 'New Chat'}
      </button>

      <div className="sessions-list">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSessionSelect(session.id)}
            className={`session-item ${
              currentSessionId === session.id ? 'active' : ''
            }`}
          >
            <h4>{session.title}</h4>
            <small>
              {new Date(session.last_message_at).toLocaleDateString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
