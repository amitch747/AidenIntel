// app/private/page.tsx  (server component)
import { createClient } from '@/utils/supabase/server';

import LogoutButton from '@/components/LogoutButton';
export default async function DesktopPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  return (
    <main>
      <h1>Welcome, {profile?.displayname ?? 'GitHub user'}!</h1>
      <LogoutButton />
    </main>
  );
}
