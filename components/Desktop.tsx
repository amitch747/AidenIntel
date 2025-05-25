'use client';
import TaskBar from '@/components/Taskbar';
import { useAppSelector, useAppDispatch } from '@/state/hooks';
import Window from './Window';
type Profile = {
  displayname?: string;
};

export default function Desktop({ profile }: { profile: Profile }) {
  const apps = useAppSelector((state) => state.desktop);
  const openApps = apps.filter((app) => app.isOpen);

  return (
    <main className="w95-desktop">
      {openApps.map((app) => (
        <Window key={app.id} {...app} />
      ))}
      <TaskBar />
    </main>
  );
}
