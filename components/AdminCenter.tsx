'use client';

import { supabase } from '@/utils/supabase/client';
import LogoutButton from './LogoutButton';
import { useEffect, useState } from 'react';
import VirtualDesktop from './VirtualDesktop';
import { Profile } from './ClientApp';
import Window from './Window';
type OnlineUser = Profile & {
  presence_ref: string;
};

export default function AdminCenter({ profile }: { profile: Profile }) {
  const [userProfiles, setUserProfiles] = useState<Profile[]>([]);

  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const presenceRoom = supabase.channel('presence');
    presenceRoom
      .on('presence', { event: 'sync' }, () => {
        const users = Object.values(
          presenceRoom.presenceState()
        ).flat() as OnlineUser[];
        setOnlineUsers(users);
      })
      .subscribe();

    const fetchUserProfiles = async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, displayname, last_online, is_admin, theme');
      const nonAdminProfiles =
        profiles?.filter((profile) => !profile.is_admin) || [];
      setUserProfiles(nonAdminProfiles);
    };
    fetchUserProfiles();

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
  return (
    <div className="admin-center">
      <div>
        <h1>Welcome to AdminCenter {profile.displayname}</h1>
        <LogoutButton />
      </div>
      <div>
        <h3>Online Users:</h3>
        {onlineUsers.length === 0 ? (
          <p>No users online</p>
        ) : (
          <ul>
            {onlineUsers.map((user) => (
              <li key={user.presence_ref} style={{ marginBottom: '10px' }}>
                <button
                  onClick={() => setSelectedUserId(user.id)}
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
                  <p>
                    Last online at:{' '}
                    {new Date(user.last_online).toLocaleString()}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="offline-users">
        <h3>Offline Users:</h3>
        <ul>
          {userProfiles.map((user) => (
            <li
              key={user.id}
              style={{
                marginBottom: '10px',
                padding: '10px 15px',
                backgroundColor: '#0f083e',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              {user.displayname}
              <p>
                Last online at: {new Date(user.last_online).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
