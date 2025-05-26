'use client';
import TaskBar from '@/components/Taskbar';
import { useAppSelector, useAppDispatch } from '@/state/hooks';
import Window from './Window';
import { useEffect } from 'react';
import { setProfile } from '@/state/slices/userSlice';

type Profile = {
  displayname?: string;
};

export default function Desktop({ profile }: { profile: Profile }) {
  const apps = useAppSelector((state) => state.desktop);
  const openApps = apps.filter((app) => app.isOpen);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setProfile(profile)); // Set it once at the top level
  }, [profile]);

  return (
    <main className="w95-desktop">
      {openApps.map((app) => (
        <Window key={app.id} {...app} />
      ))}
      <TaskBar />
    </main>
  );
}
