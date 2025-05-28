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
  // Need this shit for smooth moves
  const [liveUpdates, setLiveUpdates] = useState<Map<string, any>>(new Map());
  const [userChatState, setUserChatState] = useState<ChatState | null>(null);

  useEffect(() => {
    const userChannel = supabase.channel(`user-${userId}`);
    userChannel
      .on('broadcast', { event: 'desktop-state' }, (payload) => {
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
          // Request current state when admin connects
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
