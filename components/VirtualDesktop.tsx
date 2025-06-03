'use client';

import { useState } from 'react';
import Window from './Window';
import { WindowState } from '@/state/slices/desktopSlice';
import { ChatState } from '@/state/slices/chatSlice';
import ControlPanel from './ControlPanel';
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

  const [userChatState, setUserChatState] = useState<ChatState | null>(null);
  const [userState, setUserState] = useState<UserState>();

  const [controlMin, setControlMin] = useState(false);

  const openApps = userDesktopState.filter((app) => app.isOpen);

  return (
    <div>
      {/* Desktop with props instead of context */}
      <main className="w95-desktop">
        {/* ADMIN WINDOWS */}
        <ControlPanel
          chatState={userChatState}
          userState={userState}
          windowState={userDesktopState}
          controlMin={controlMin}
          setControlMin={setControlMin}
          setUserDesktopState={setUserDesktopState}
          setUserChatState={setUserChatState}
          setUserState={setUserState}
          userId={userId}
        />
        {/* USER WINDOWS */}
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
          <button
            key={0}
            className={`w95-button ${controlMin ? 'minimized' : 'active'}`}
            onClick={() => setControlMin(!controlMin)}
          >
            Control
          </button>
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
