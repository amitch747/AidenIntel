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
    const presenceRoom = supabase.channel('presence');

    presenceRoom.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceRoom.track({
          user_id: profile.id,
          displayname: profile.displayname,
          is_admin: profile.is_admin,
          online_at: new Date().toISOString(),
        });
      }
    });

    // even if browser crashes, supabase will handle unsubbing
    return () => {
      presenceRoom.unsubscribe();
    };
  }, [profile]); // Re-run if profile changes

  return (
    <Provider store={store}>
      {profile.is_admin ? <AdminCenter /> : <Desktop profile={profile} />}
    </Provider>
  );
}
