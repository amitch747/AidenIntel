'use client';

import { supabase } from '@/utils/supabase/client';
import LogoutButton from './LogoutButton';
import { useEffect, useState } from 'react';
import VirtualDesktop from './VirtualDesktop';
import { Profile } from './ClientApp';
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
      .on('broadcast', { event: 'request_admin_status' }, async () => {
        // Respond to user requests for admin status
        await presenceRoom.send({
          type: 'broadcast',
          event: 'admin_status',
          payload: {
            status: 'online',
            timestamp: new Date().toISOString(),
          },
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Initial broadcast
          await presenceRoom.send({
            type: 'broadcast',
            event: 'admin_status',
            payload: {
              status: 'online',
              timestamp: new Date().toISOString(),
            },
          });
        }
      });

    // Cleanup: broadcast admin going offline
    return () => {
      presenceRoom.send({
        type: 'broadcast',
        event: 'admin_status',
        payload: {
          status: 'offline',
          timestamp: new Date().toISOString(),
        },
      });
      presenceRoom.unsubscribe();
    };
  }, [profile]);

  useEffect(() => {
    // Fetch all user profiles from database
    const fetchUserProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles') // assuming your table name
        .select('*');

      if (data && !error) {
        setUserProfiles(data);
      }
    };

    fetchUserProfiles();
  }, [onlineUsers]);

  // Then you'll need to calculate offline users in your render:
  const offlineUsers = userProfiles.filter(
    (profile) => !onlineUsers.some((onlineUser) => onlineUser.id === profile.id)
  );

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
                  {`Control ${user.displayname}'s Desktop`}
                  <p>
                    Last online at:
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
          {offlineUsers.map((user) => (
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
