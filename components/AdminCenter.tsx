'use client';

import { supabase } from '@/utils/supabase/client';
import LogoutButton from './LogoutButton';
import { useEffect, useState } from 'react';
import VirtualDesktop from './VirtualDesktop';

type OnlineUser = {
  presence_ref: string;
  user_id: string;
  displayname: string;
  is_admin: boolean;
  online_at: string;
};

export default function AdminCenter() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const presenceRoom = supabase.channel('presence');
    presenceRoom
      .on('presence', { event: 'sync' }, () => {
        const users = Object.values(
          presenceRoom.presenceState()
        ).flat() as OnlineUser[];
        // Filter out admins - only show regular users
        const regularUsers = users.filter((user) => !user.is_admin);
        setOnlineUsers(regularUsers);
      })
      .subscribe();

    return () => {
      presenceRoom.unsubscribe();
    };
  }, []);

  if (selectedUserId) {
    return (
      <VirtualDesktop
        userId={selectedUserId}
        onBack={() => setSelectedUserId(null)}
      />
    );
  }

  // Otherwise show user list
  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Control Center</h2>
      <LogoutButton />

      <h3>Online Users:</h3>
      {onlineUsers.length === 0 ? (
        <p>No users online</p>
      ) : (
        <ul>
          {onlineUsers.map((user) => (
            <li key={user.presence_ref} style={{ marginBottom: '10px' }}>
              <button
                onClick={() => setSelectedUserId(user.user_id)}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#007acc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Control {user.displayname}'s Desktop
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
