// app/page.tsx

import { ensureProfile } from '@/utils/supabase/server';
import LogoutButton from '@/components/LogoutButton';
export default async function DesktopPage() {
  const profile = await ensureProfile();

  return (
    <main>
      <h1>Welcome, {profile?.displayname ?? 'User'}!</h1>
      <LogoutButton />
    </main>
  );
}
