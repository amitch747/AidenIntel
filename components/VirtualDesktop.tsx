'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import Window from './Window';
import { WindowState } from '@/state/slices/desktopSlice';
import { ChatState } from '@/state/slices/chatSlice';
import { Profile } from './ClientApp';

import { UserState } from '@/state/slices/userSlice';
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
  const [userState, setUserState] = useState<UserState>();
  const [adminMessageInput, setAdminMessageInput] = useState('');
  const [windowInputs, setWindowInputs] = useState<{
    [windowId: string]: { x: number; y: number; w: number; h: number };
  }>({});

  useEffect(() => {
    const userChannel = supabase.channel(`user-${userId}`);
    userChannel
      .on('broadcast', { event: 'desktop-state' }, (payload) => {
        setUserDesktopState(payload.payload.windows);
        setUserChatState(payload.payload.chat || null);
        setUserState(payload.payload.user);
      })
      .on('broadcast', { event: 'window-live-update' }, (payload) => {
        setLiveUpdates(
          (prev) => new Map(prev.set(payload.payload.windowId, payload.payload))
        );
      })
      // Send request once when we mount
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await userChannel.send({
            type: 'broadcast',
            event: 'admin-request-state',
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
    sendHeader: (message: string) => {
      if (userChatState?.currentSessionId) {
        sendControlCommand('SEND_HEADER', {
          message,
          sessionId: userChatState.currentSessionId,
        });
      }
    },

    sendThinking: (thinking: boolean) => {
      sendControlCommand('TOGGLE_THINKING', { thinking });
    },

    createSession: () => {
      sendControlCommand('CREATE_SESSION', {});
    },
    deleteSession: (sessionId: string) => {
      sendControlCommand('DELETE_SESSION', { sessionId });
    },
    renameSession: (sessionId: string, name: string) => {
      sendControlCommand('RENAME_SESSION', { sessionId, name });
    },
    updateInput: (input: string) => {
      sendControlCommand('UPDATE_USER_INPUT', { input });
    },
  };

  const controlUserWindows = {
    openApp: (windowId: string) => {
      sendControlCommand('OPEN_APP', { windowId });
    },
    closeApp: (windowId: string) => {
      sendControlCommand('CLOSE_APP', { windowId });
    },
    minApp: (windowId: string) => {
      sendControlCommand('MIN_APP', { windowId });
    },

    maxApp: (windowId: string) => {
      sendControlCommand('MAX_APP', { windowId });
    },

    updateWindowBounds: (
      windowId: string,
      x: number,
      y: number,
      w: number,
      h: number
    ) => {
      sendControlCommand('UPDATE_WINDOW_BOUNDS', { windowId, x, y, w, h });
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

  console.log(userState);
  return (
    <div>
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
                  <div style={{ fontWeight: 'bold' }}>{session.title} </div>
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
                    onClick={() =>
                      controlUserChat.renameSession(
                        session.id,
                        adminMessageInput.trim()
                      )
                    }
                    className="w95-button"
                    style={{ fontSize: '9px', padding: '2px 4px' }}
                  >
                    Rename
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
              style={{ marginTop: '5px', fontSize: '11px' }}
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
            <div style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
              <input
                type="text"
                value={adminMessageInput}
                onChange={(e) => setAdminMessageInput(e.target.value)}
                placeholder="What's up stupid"
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
                Send
              </button>
              <button
                onClick={() => {
                  controlUserChat.sendThinking(!userChatState.thinking);
                }}
                className="w95-button"
                style={{ fontSize: '11px' }}
              >
                {userChatState.thinking ? '...' : 'Think'}
              </button>
              <button
                onClick={() => {
                  if (adminMessageInput.trim()) {
                    controlUserChat.sendHeader(adminMessageInput);
                    setAdminMessageInput('');
                  }
                }}
                className="w95-button"
                style={{ fontSize: '11px' }}
                disabled={
                  !adminMessageInput.trim() || !userChatState.currentSessionId
                }
              >
                Header
              </button>
            </div>
          </div>

          {/* Window Positioning Controls */}
          <div style={{ marginBottom: '15px' }}>
            <div
              style={{
                fontWeight: 'bold',
                marginBottom: '5px',
                fontSize: '12px',
              }}
            >
              Window Positioning
            </div>
            {userDesktopState
              .filter((window) => window.isOpen)
              .map((window) => (
                <div
                  key={window.id}
                  style={{
                    marginBottom: '8px',
                    padding: '4px',
                    border: '1px solid #999',
                    backgroundColor: '#f0f0f0',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 'bold',
                      marginBottom: '4px',
                    }}
                  >
                    {window.title}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '4px',
                      flexWrap: 'wrap',
                      marginBottom: '4px',
                    }}
                  >
                    <input
                      type="number"
                      value={windowInputs[window.id]?.x ?? ''}
                      placeholder="X"
                      style={{ width: '40px', fontSize: '9px' }}
                      onChange={(e) => {
                        setWindowInputs((prev) => ({
                          ...prev,
                          [window.id]: {
                            ...prev[window.id],
                            x: parseInt(e.target.value) || 0,
                          },
                        }));
                      }}
                    />
                    <input
                      type="number"
                      value={windowInputs[window.id]?.y ?? ''}
                      placeholder="Y"
                      style={{ width: '40px', fontSize: '9px' }}
                      onChange={(e) => {
                        setWindowInputs((prev) => ({
                          ...prev,
                          [window.id]: {
                            ...prev[window.id],
                            y: parseInt(e.target.value) || 0,
                          },
                        }));
                      }}
                    />
                    <input
                      type="number"
                      value={windowInputs[window.id]?.w ?? ''}
                      placeholder="W"
                      style={{ width: '50px', fontSize: '9px' }}
                      onChange={(e) => {
                        setWindowInputs((prev) => ({
                          ...prev,
                          [window.id]: {
                            ...prev[window.id],
                            w: parseInt(e.target.value) || 100,
                          },
                        }));
                      }}
                    />
                    <input
                      type="number"
                      value={windowInputs[window.id]?.h ?? ''}
                      placeholder="H"
                      style={{ width: '50px', fontSize: '9px' }}
                      onChange={(e) => {
                        setWindowInputs((prev) => ({
                          ...prev,
                          [window.id]: {
                            ...prev[window.id],
                            h: parseInt(e.target.value) || 100,
                          },
                        }));
                      }}
                    />
                    <button
                      onClick={() => {
                        const inputs = windowInputs[window.id];
                        if (inputs) {
                          controlUserWindows.updateWindowBounds(
                            window.id,
                            inputs.x,
                            inputs.y,
                            inputs.w,
                            inputs.h
                          );
                        }
                      }}
                      className="w95-button"
                      style={{ fontSize: '8px', padding: '1px 3px' }}
                    >
                      Apply
                    </button>
                  </div>
                  <div style={{ fontSize: '8px', color: '#666' }}>
                    Current: {window.position.x}, {window.position.y},{' '}
                    {window.position.w}x{window.position.h}
                  </div>
                  {/* Preset positioning buttons */}
                  <div
                    style={{ display: 'flex', gap: '2px', marginTop: '4px' }}
                  >
                    <button
                      onClick={() =>
                        controlUserWindows.updateWindowBounds(
                          window.id,
                          0,
                          0,
                          400,
                          300
                        )
                      }
                      style={{ fontSize: '8px', padding: '1px 3px' }}
                      className="w95-button"
                    >
                      Top-Left
                    </button>
                    <button
                      onClick={() =>
                        controlUserWindows.updateWindowBounds(
                          window.id,
                          200,
                          100,
                          600,
                          400
                        )
                      }
                      style={{ fontSize: '8px', padding: '1px 3px' }}
                      className="w95-button"
                    >
                      Center
                    </button>
                    <button
                      onClick={() =>
                        controlUserWindows.updateWindowBounds(
                          window.id,
                          100,
                          50,
                          800,
                          600
                        )
                      }
                      style={{ fontSize: '8px', padding: '1px 3px' }}
                      className="w95-button"
                    >
                      Large
                    </button>
                  </div>
                </div>
              ))}
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

                  <button
                    onClick={() => controlUserWindows.minApp(window.id)}
                    className="w95-button"
                    style={{ fontSize: '8px', padding: '1px 3px' }}
                  >
                    {window.isMinimized ? 'UnMin' : 'Min'}
                  </button>

                  <button
                    onClick={() => controlUserWindows.maxApp(window.id)}
                    className="w95-button"
                    style={{ fontSize: '8px', padding: '1px 3px' }}
                  >
                    {window.isMaximized ? 'UnMax' : 'Max'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop with props instead of context */}
      <main className="w95-desktop">
        {openApps.map((app) => (
          <Window
            key={app.id}
            {...app}
            // Pass user's data directly as props
            adminChatData={userChatState || undefined}
            adminUserData={userState || undefined}
            isAdminView={true}
          />
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
      </main>

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
        Controlling User: {userState?.profile?.displayname}
      </div>

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
    </div>
  );
}
