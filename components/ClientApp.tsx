'use client';
import { Provider } from 'react-redux';
import { store } from '@/state/store';
import Desktop from '@/components/Desktop';
import AdminCenter from './AdminCenter';
import { supabase } from '@/utils/supabase/client';
import { useEffect } from 'react';
import { UUID } from 'crypto';
type Profile = {
  id: UUID;
  theme: string;
  displayname: string;
  is_admin: boolean;
};
// https://supabase.com/docs/guides/realtime/presence?queryGroups=language&language=js
export default function ClientApp({ profile }: { profile: Profile }) {
  // Only subscribe if not admin, admin will sub within admincenter

  useEffect(() => {
    if (profile.is_admin) return;

    console.log('🟢 User joining presence channel:', profile.displayname);
    const presenceRoom = supabase.channel('presence');

    presenceRoom.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log(
          '✅ User presence subscribed, tracking presence for:',
          profile.displayname
        );
        await presenceRoom.track({
          user_id: profile.id,
          displayname: profile.displayname,
          is_admin: profile.is_admin,
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      console.log('❌ User leaving presence channel:', profile.displayname);
      presenceRoom.unsubscribe();
    };
  }, [profile]);

  return (
    <Provider store={store}>
      {profile.is_admin ? <AdminCenter /> : <Desktop profile={profile} />}
    </Provider>
  );
}
