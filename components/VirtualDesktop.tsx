'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import Window from './Window';
import { WindowState } from '@/state/slices/desktopSlice';
import { ChatState } from '@/state/slices/chatSlice';
import { AdminDataProvider } from '@/components/AdminDataContext';

interface VirtualDesktopProps {
  userId: string;
  onBack: () => void;
}

export default function VirtualDesktop({
  userId,
  onBack,
}: VirtualDesktopProps) {
  const [userDesktopState, setUserDesktopState] = useState<WindowState[]>([]);
  const [liveUpdates, setLiveUpdates] = useState<Map<string, any>>(new Map());
  const [userChatState, setUserChatState] = useState<ChatState | null>(null);
  const [adminMessageInput, setAdminMessageInput] = useState('');

  useEffect(() => {
    const userChannel = supabase.channel(`user-${userId}`);
    userChannel
      .on('broadcast', { event: 'desktop-state' }, (payload) => {
        console.log(
          '🔄 Admin received updated desktop-state:',
          payload.payload
        );
        setUserDesktopState(payload.payload.windows);
        setUserChatState(payload.payload.chat || null);
      })
      .on('broadcast', { event: 'window-live-update' }, (payload) => {
        setLiveUpdates(
          (prev) => new Map(prev.set(payload.payload.windowId, payload.payload))
        );
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🟢 Admin subscribed to user channel');
          await userChannel.send({
            type: 'broadcast',
            event: 'admin-request-state',
            payload: { adminId: 'admin-id' },
          });
        }
      });

    return () => {
      userChannel.unsubscribe();
    };
  }, [userId]);

  // Admin control functions
  const sendControlCommand = async (command: string, payload: any) => {
    const userChannel = supabase.channel(`user-${userId}`);
    await userChannel.send({
      type: 'broadcast',
      event: 'admin-control',
      payload: {
        command,
        data: payload,
        adminId: 'admin-id',
      },
    });
  };

  const controlUserChat = {
    selectSession: (sessionId: string) => {
      sendControlCommand('SELECT_SESSION', { sessionId });
    },
    sendMessage: (message: string) => {
      if (userChatState?.currentSessionId) {
        sendControlCommand('SEND_MESSAGE', {
          message,
          sessionId: userChatState.currentSessionId,
        });
      }
    },
    createSession: () => {
      sendControlCommand('CREATE_SESSION', {});
    },
    deleteSession: (sessionId: string) => {
      sendControlCommand('DELETE_SESSION', { sessionId });
    },
    updateInput: (input: string) => {
      sendControlCommand('UPDATE_USER_INPUT', { input });
    },
  };

  const controlUserWindows = {
    moveWindow: (windowId: string, x: number, y: number) => {
      sendControlCommand('MOVE_WINDOW', { windowId, x, y });
    },
    openApp: (windowId: string) => {
      sendControlCommand('OPEN_APP', { windowId });
    },
    closeApp: (windowId: string) => {
      sendControlCommand('CLOSE_APP', { windowId });
    },
  };

  const openApps = userDesktopState
    .filter((app) => app.isOpen)
    .map((app) => {
      const liveUpdate = liveUpdates.get(app.id);
      if (liveUpdate) {
        return {
          ...app,
          position: {
            ...app.position,
            ...liveUpdate.position,
          },
        };
      }
      return app;
    });

  return (
    <div
      style={{ height: '100vh', position: 'relative', background: '#008080' }}
    >
      <button
        onClick={onBack}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          padding: '8px 16px',
          backgroundColor: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Back to Admin Panel
      </button>

      {/* Admin Control Panel */}
      {userChatState && (
        <div
          style={{
            position: 'fixed',
            top: '60px',
            right: '10px',
            width: '320px',
            maxHeight: '500px',
            backgroundColor: '#c0c0c0',
            border: '2px outset #c0c0c0',
            padding: '10px',
            zIndex: 9999,
            overflow: 'auto',
          }}
        >
          <div
            style={{
              backgroundColor: '#000080',
              color: 'white',
              padding: '4px 8px',
              margin: '-10px -10px 10px -10px',
              fontWeight: 'bold',
              fontSize: '11px',
            }}
          >
            Admin Mission Control
          </div>

          {/* Chat Session Controls */}
          <div style={{ marginBottom: '15px' }}>
            <div
              style={{
                fontWeight: 'bold',
                marginBottom: '5px',
                fontSize: '12px',
              }}
            >
              Chat Sessions ({userChatState.sessionList.length})
            </div>
            {userChatState.sessionList.map((session) => (
              <div
                key={session.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px',
                  backgroundColor:
                    session.id === userChatState.currentSessionId
                      ? '#ffff00'
                      : '#fff',
                  margin: '2px 0',
                  border: '1px solid #999',
                  fontSize: '11px',
                }}
              >
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 'bold' }}>{session.title}</div>
                  <div style={{ fontSize: '9px', color: '#666' }}>
                    {new Date(session.last_message_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  <button
                    onClick={() => controlUserChat.selectSession(session.id)}
                    disabled={session.id === userChatState.currentSessionId}
                    className="w95-button"
                    style={{ fontSize: '9px', padding: '2px 4px' }}
                  >
                    {session.id === userChatState.currentSessionId
                      ? 'Active'
                      : 'Select'}
                  </button>
                  <button
                    onClick={() => controlUserChat.deleteSession(session.id)}
                    className="w95-button"
                    style={{ fontSize: '9px', padding: '2px 4px' }}
                  >
                    Del
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => controlUserChat.createSession()}
              className="w95-button"
              style={{ width: '100%', marginTop: '5px', fontSize: '11px' }}
            >
              Create New Session
            </button>
          </div>

          {/* Message Controls */}
          <div style={{ marginBottom: '15px' }}>
            <div
              style={{
                fontWeight: 'bold',
                marginBottom: '5px',
                fontSize: '12px',
              }}
            >
              Message Control
            </div>
            <div style={{ fontSize: '11px', marginBottom: '5px' }}>
              User's Input: "{userChatState.userInput}"
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
            >
              <input
                type="text"
                value={adminMessageInput}
                onChange={(e) => setAdminMessageInput(e.target.value)}
                placeholder="Send message as user..."
                className="w95-input"
                style={{ fontSize: '11px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && adminMessageInput.trim()) {
                    controlUserChat.sendMessage(adminMessageInput);
                    setAdminMessageInput('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (adminMessageInput.trim()) {
                    controlUserChat.sendMessage(adminMessageInput);
                    setAdminMessageInput('');
                  }
                }}
                className="w95-button"
                style={{ fontSize: '11px' }}
                disabled={
                  !adminMessageInput.trim() || !userChatState.currentSessionId
                }
              >
                Send as User
              </button>
              <button
                onClick={() =>
                  controlUserChat.updateInput('Admin controlled this input')
                }
                className="w95-button"
                style={{ fontSize: '11px' }}
              >
                Control User Input
              </button>
            </div>
          </div>

          {/* Window Controls */}
          <div>
            <div
              style={{
                fontWeight: 'bold',
                marginBottom: '5px',
                fontSize: '12px',
              }}
            >
              Window Control
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {userDesktopState.map((window) => (
                <div
                  key={window.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '10px',
                    backgroundColor: window.isOpen ? '#90EE90' : '#FFB6C1',
                    padding: '2px 4px',
                    border: '1px solid #999',
                  }}
                >
                  <span style={{ marginRight: '4px' }}>{window.title}</span>
                  {window.isOpen ? (
                    <button
                      onClick={() => controlUserWindows.closeApp(window.id)}
                      className="w95-button"
                      style={{ fontSize: '8px', padding: '1px 3px' }}
                    >
                      Close
                    </button>
                  ) : (
                    <button
                      onClick={() => controlUserWindows.openApp(window.id)}
                      className="w95-button"
                      style={{ fontSize: '8px', padding: '1px 3px' }}
                    >
                      Open
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AdminDataProvider
        value={{
          userChatState: userChatState || undefined,
          isAdminView: true,
        }}
      >
        <div className="w95-desktop">
          {openApps.map((app) => (
            <Window key={app.id} {...app} />
          ))}

          <div className="w95-taskbar">
            {userDesktopState.map(({ id, appName, isOpen, isMinimized }) => (
              <button
                key={id}
                className={`w95-button ${
                  isOpen ? (isMinimized ? 'minimized' : 'active') : ''
                }`}
              >
                {appName}
              </button>
            ))}
          </div>
        </div>
      </AdminDataProvider>

      <div
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          zIndex: 9999,
        }}
      >
        Controlling User: {userId}
      </div>
    </div>
  );
}
