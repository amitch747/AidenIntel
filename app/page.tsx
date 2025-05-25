import { ensureProfile } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ClientDesktop from '@/components/ClientDesktop';

export default async function Page() {
  const profile = await ensureProfile();

  if (!profile) {
    redirect('/login');
  }

  return <ClientDesktop profile={profile} />;
}
