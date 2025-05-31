'use client';

import { Provider } from 'react-redux';
import { store } from '@/state/store';
import Desktop from '@/components/Desktop';
import AdminCenter from './AdminCenter';
import { supabase } from '@/utils/supabase/client';
import { useEffect } from 'react';
import { UUID } from 'crypto';

export type Profile = {
  id: UUID;
  is_admin: boolean;
  displayname?: string;
  theme: string;
  last_online: string;
};

// https://supabase.com/docs/guides/realtime/presence?queryGroups=language&language=js
export default function ClientApp({ profile }: { profile: Profile }) {
  // Updating last oneline
  useEffect(() => {
    const updateLastOnline = async () => {
      try {
        await supabase
          .from('profiles')
          .update({ last_online: new Date().toISOString() })
          .eq('id', profile.id);
      } catch (error) {
        console.error(error);
      }
    };

    updateLastOnline();
  }, [profile.id]);

  useEffect(() => {
    // Only subscribe if not admin, admin will sub later within admincenter
    if (profile.is_admin) return;

    const presenceRoom = supabase.channel('presence');
    presenceRoom.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceRoom.track({
          id: profile.id,
          is_admin: profile.is_admin,
          displayname: profile.displayname,
          theme: profile.displayname,
          last_online: profile.last_online,
        });
      }
    });
    return () => {
      presenceRoom.unsubscribe();
    };
  }, [profile]);

  return (
    <>
      {profile.is_admin ? (
        <AdminCenter profile={profile} />
      ) : (
        <Provider store={store}>
          <Desktop profile={profile} />
        </Provider>
      )}
    </>
  );
}
