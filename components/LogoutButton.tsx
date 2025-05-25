'use client';

import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const theme = 'w95';

export default function LogoutButton() {
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut(); // removes JWT cookie
    router.push('/login'); // back to login page
  }

  return (
    <button onClick={signOut} className={`${theme}-button`}>
      Sign out
    </button>
  );
}
