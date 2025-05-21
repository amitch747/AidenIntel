'use client';

import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut(); // removes JWT cookie
    router.push('/login'); // back to login page
  }

  return (
    <button onClick={signOut} className="border px-3 py-1 rounded">
      Sign out
    </button>
  );
}
