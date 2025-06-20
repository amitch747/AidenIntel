'use client';

import Desktop from '@/components/Desktop';
import AdminCenter from '@/components/AdminCenter';
import { supabase } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { UUID } from 'crypto';
import StartupScreen from '@/components/StartupScreen';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/state/store';

export type Profile = {
  id: UUID;
  is_admin: boolean;
  displayname?: string;
  theme: string;
  last_online: string;
};

export default function ClientApp({ profile }: { profile: Profile }) {
  const [showStartup, setShowStartup] = useState(true);

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

  if (profile.is_admin) {
    return <AdminCenter profile={profile} />;
  }

  return (
    <Provider store={store}>
      {showStartup && <StartupScreen onDone={() => setShowStartup(false)} />}
      <PersistGate loading={null} persistor={persistor}>
        <Desktop profile={profile} />
      </PersistGate>
    </Provider>
  );
}
