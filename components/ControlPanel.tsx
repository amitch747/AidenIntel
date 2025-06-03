'use client';

import { Rnd } from 'react-rnd';
import { UserState } from '@/state/slices/userSlice';
import { WindowState } from '@/state/slices/desktopSlice';
import { ChatState } from '@/state/slices/chatSlice';
import { GrFormSubtract, GrLayer } from 'react-icons/gr';
import { type Dispatch, type SetStateAction, useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

export default function ControlPanel({
  chatState,
  userState,
  windowState,
  controlMin,
  setControlMin,
  setUserDesktopState,
  setUserChatState,
  setUserState,
  userId,
}: {
  chatState: ChatState | null;
  userState: UserState | undefined;
  windowState: WindowState[];
  controlMin: boolean;
  setControlMin: Dispatch<SetStateAction<boolean>>;
  setUserDesktopState: Dispatch<SetStateAction<WindowState[]>>;
  setUserChatState: Dispatch<SetStateAction<ChatState | null>>;
  setUserState: Dispatch<SetStateAction<UserState | undefined>>;
  userId: string;
}) {
  const title = 'Control';
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 200, y: 200 });
  const [size, setSize] = useState({ width: 200, height: 200 });
  const [adminMessageInput, setAdminMessageInput] = useState('');

  const minDimensions = { minWidth: 200, minHeight: 300 };

  useEffect(() => {
    const userChannel = supabase.channel(`user-${userId}`);
    userChannel
      .on('broadcast', { event: 'desktop-state' }, (payload) => {
        setUserDesktopState(payload.payload.windows);
        setUserChatState(payload.payload.chat || null);
        setUserState(payload.payload.user);
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
  }, [userId, setUserDesktopState, setUserChatState, setUserState]);

  // Admin control functions
  const sendControlCommand = async (command: string, payload: object) => {
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
      if (chatState?.currentSessionId) {
        sendControlCommand('SEND_MESSAGE', {
          message,
          sessionId: chatState.currentSessionId,
        });
      }
    },
    sendHeader: (message: string) => {
      if (chatState?.currentSessionId) {
        sendControlCommand('SEND_HEADER', {
          message,
          sessionId: chatState.currentSessionId,
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

  const controlUser = {
    renameUser: (input: string) => {
      console.log('rename');
      sendControlCommand('RENAME_USER', { userId, input });
    },
    toggleCursor: (toggle: boolean) => {
      console.log(toggle);
      sendControlCommand('CURSOR', { toggle });
    },
    toggleBack: (toggle: boolean) => {
      sendControlCommand('BACK', { toggle });
    },
    toggleVoice: (toggle: boolean) => {
      sendControlCommand('VOICE', { toggle });
    },
    toggleWeb3: (toggle: boolean) => {
      sendControlCommand('WEB3', { toggle });
    },
    toggleWindow: (toggle: boolean) => {
      sendControlCommand('WINDOW', { toggle });
    },
    toggleTime: (toggle: boolean) => {
      sendControlCommand('TIME', { toggle });
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

  return (
    <Rnd
      position={isMaximized ? { x: 0, y: 0 } : position}
      enableResizing={!isMaximized}
      size={isMaximized ? { width: '100%', height: '100%' } : size}
      bounds="parent"
      dragHandleClassName="w95-titlebar"
      minWidth={minDimensions.minWidth}
      minHeight={minDimensions.minHeight}
      style={{ zIndex: 9900 }}
      onDragStop={(e, d) => {
        setPosition({ x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setSize({
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        });
        setPosition(position);
      }}
      className={`w95-window ${controlMin ? 'minwindow' : ''}`}
    >
      <div className={`w95-titlebar`}>
        <span>{title}</span>
        <div className="titlebar-buttons">
          <button
            className={`w95-minimize`}
            onClick={() => {
              setControlMin(!controlMin);
            }}
          >
            <GrFormSubtract />
          </button>
          <button
            className={`w95-maximize`}
            onClick={() => {
              setIsMaximized(!isMaximized);
            }}
          >
            <GrLayer />
          </button>
        </div>
      </div>
      {chatState && (
        <div className="w95-window-body">
          {/* Chat Session Controls */}
          <div style={{ marginBottom: '15px' }}>
            <div
              style={{
                fontWeight: 'bold',
                marginBottom: '5px',
                fontSize: '12px',
              }}
            >
              Chat Sessions ({chatState.sessionList.length})
            </div>
            {chatState.sessionList.map((session) => (
              <div
                key={session.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px',
                  backgroundColor:
                    session.id === chatState.currentSessionId
                      ? '#fd5a1a'
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
                    disabled={session.id === chatState.currentSessionId}
                    className="w95-button"
                    style={{ fontSize: '9px', padding: '2px 4px' }}
                  >
                    {session.id === chatState.currentSessionId
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
                placeholder="What's up stupid do u think ur better than me?"
                className="w95-input flex-1"
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
                  !adminMessageInput.trim() || !chatState.currentSessionId
                }
              >
                Send
              </button>
              <button
                onClick={() => {
                  controlUserChat.sendThinking(!chatState.thinking);
                }}
                className="w95-button"
                style={{ fontSize: '11px' }}
              >
                {chatState.thinking ? '...' : 'Think'}
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
                  !adminMessageInput.trim() || !chatState.currentSessionId
                }
              >
                Header
              </button>
            </div>
          </div>

          {/* SETTINGS Controls */}
          <div style={{ marginBottom: '15px' }}>
            <div
              style={{
                fontWeight: 'bold',
                marginBottom: '5px',
                fontSize: '12px',
              }}
            >
              Settings Control
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
              <button
                onClick={() => {
                  if (adminMessageInput.trim()) {
                    controlUser.renameUser(adminMessageInput);
                    setAdminMessageInput('');
                  }
                }}
                className="w95-button"
                style={{ fontSize: '11px' }}
                disabled={!adminMessageInput.trim()}
              >
                Rename
              </button>
              <button
                onClick={() => {
                  controlUser.toggleCursor(!userState?.coolCursor);
                }}
                className="w95-button"
                style={{ fontSize: '11px' }}
              >
                {userState?.coolCursor ? 'No Cursor' : 'Cursor'}
              </button>
              <button
                onClick={() => {
                  controlUser.toggleBack(!userState?.backseat);
                }}
                className="w95-button"
                style={{ fontSize: '11px' }}
              >
                {userState?.backseat ? 'No Back' : 'Backseat'}
              </button>
              <button
                onClick={() => {
                  controlUser.toggleVoice(!userState?.voice);
                }}
                className="w95-button"
                style={{ fontSize: '11px' }}
              >
                {userState?.voice ? 'No voice' : 'Voice'}
              </button>
              <button
                onClick={() => {
                  controlUser.toggleWeb3(!userState?.web3);
                }}
                className="w95-button"
                style={{ fontSize: '11px' }}
              >
                {userState?.web3 ? 'No web3' : 'Web3'}
              </button>
              <button
                onClick={() => {
                  controlUser.toggleWindow(!userState?.window);
                }}
                className="w95-button"
                style={{ fontSize: '11px' }}
              >
                {userState?.coolCursor ? 'No Window' : 'Window'}
              </button>
              <button
                onClick={() => {
                  controlUser.toggleTime(!userState?.time);
                }}
                className="w95-button"
                style={{ fontSize: '11px' }}
              >
                {userState?.time ? 'No Time' : 'Time'}
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
            {windowState
              .filter((window) => window.isOpen)
              .map((window) => (
                <div
                  key={window.id}
                  style={{
                    marginBottom: '8px',
                    padding: '4px',
                  }}
                  className="flex-row"
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
              {windowState.map((window) => (
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
    </Rnd>
  );
}
