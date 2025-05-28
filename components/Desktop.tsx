'use client';
import TaskBar from '@/components/Taskbar';
import { useAppSelector, useAppDispatch } from '@/state/hooks';
import Window from './Window';
import { useEffect } from 'react';
import { setProfile } from '@/state/slices/userSlice';
import { supabase } from '@/utils/supabase/client';
import { UUID } from 'crypto';

type Profile = {
  id: UUID;
  theme: string;
  displayname: string;
  is_admin: boolean;
};

export default function Desktop({ profile }: { profile: Profile }) {
  const apps = useAppSelector((state) => state.desktop);
  const chatState = useAppSelector((state) => state.chat);
  const openApps = apps.filter((app) => app.isOpen);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setProfile(profile));
  }, [profile, dispatch]); // Not sure why I need dispatch in here. Vercel wanted it
  // Now that profile is in the store we can access anywhere, no more drilling ;))))))))))) Unless ur mom shows up

  // In Desktop.tsx - replace both useEffects with this single one:
  useEffect(() => {
    const userChannel = supabase.channel(`user-${profile.id}`);

    userChannel
      .on('broadcast', { event: 'admin-request-state' }, async () => {
        // Send current state when admin requests it
        await userChannel.send({
          type: 'broadcast',
          event: 'desktop-state',
          payload: {
            windows: apps,
            chat: chatState,
            userId: profile.id,
          },
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Also send state when user channel first connects
          await userChannel.send({
            type: 'broadcast',
            event: 'desktop-state',
            payload: {
              windows: apps,
              userId: profile.id,
            },
          });
        }
      });

    return () => {
      userChannel.unsubscribe();
    };
  }, [apps, chatState, profile.id]);

  return (
    <main className="w95-desktop">
      {openApps.map((app) => (
        <Window key={app.id} {...app} />
      ))}
      <TaskBar />
    </main>
  );
}
