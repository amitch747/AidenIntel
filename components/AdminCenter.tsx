'use client';

import { supabase } from '@/utils/supabase/client';
import LogoutButton from './LogoutButton';
import { useEffect, useState } from 'react';

type OnlineUser = {
  presence_ref: string;
  user_id: string;
  displayname: string;
  is_admin: boolean;
  online_at: string;
};

export default function AdminCenter() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

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

    return () => {
      presenceRoom.unsubscribe();
    };
  }, []);

  return (
    <div>
      Welcome to admin
      <LogoutButton />
      <ul>
        {onlineUsers.map((user) => (
          <li key={user.presence_ref}>
            {user.displayname} ({user.is_admin ? 'Admin' : 'User'})
          </li>
        ))}
      </ul>
    </div>
  );
}

// Need to return list of online users with name and number of messages sent without response from me
//
