'use client';

import { Provider } from 'react-redux';
import { store } from '@/state/store';
import Desktop from '@/components/Desktop';
import AdminCenter from './AdminCenter';
import { supabase } from '@/utils/supabase/client';
import { useEffect } from 'react';
import { UUID } from 'crypto';
import { useAppSelector, useAppDispatch } from '@/state/hooks';
import { toggleAdmin } from '@/state/slices/userSlice';
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
