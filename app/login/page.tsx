// app/login/page.tsx
'use client';

import { supabase } from '@/utils/supabase/client';

export default function LoginPage() {
  async function signInWithGitHub() {
    await supabase.auth.signInWithOAuth({ provider: 'github' });
    // Supabase will redirect to GitHub, then back with the JWT cookie.
  }

  return (
    <main className="grid place-items-center min-h-screen bg-black text-white">
      <button
        onClick={signInWithGitHub}
        className="border border-white px-6 py-3 rounded"
      >
        Sign in with GitHub
      </button>
    </main>
  );
}
