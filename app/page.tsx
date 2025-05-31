import { ensureProfile } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ClientApp from '@/components/ClientApp';

export default async function Page() {
  const profile = await ensureProfile();

  if (!profile) {
    redirect('/login');
  }
  // We access the user differently in many places but ensureProfile gives all the info needed so may as well drill it
  return <ClientApp profile={profile} />;
}
