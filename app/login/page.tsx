'use client';

import { supabase } from '@/utils/supabase/client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Provider } from '@supabase/supabase-js';
import { FaGithub, FaDiscord } from 'react-icons/fa';

const providers: {
  id: Provider;
  label: string;
  Icon: React.FC<{ size?: number }>;
}[] = [
  { id: 'github', label: 'GitHub', Icon: FaGithub },
  { id: 'discord', label: 'Discord', Icon: FaDiscord },
];

export default function LoginPage() {
  // Send user back home if logged in
  const router = useRouter();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/');
    });
  }, [router]);

  // Sign in with supabase auth then redirect
  async function signIn(provider: Provider) {
    const base = { redirectTo: `${location.origin}` };

    // Skip the consent page for Discord once the user has approved scopes
    const options =
      provider === 'discord'
        ? { ...base, queryParams: { prompt: 'none' } }
        : base; // GitHub works fine with the default

    await supabase.auth.signInWithOAuth({ provider, options });
  }

  return (
    <main className="grid place-items-center min-h-screen bg-[#00808066]">
      <div className="w95-window shadow-lg px-8 py-6" style={{ width: 280 }}>
        <h1 className="text-center mb-4 text-lg">AidenIntelligence</h1>

        {providers.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => signIn(id)}
            className="w95-button w-full mb-2 justify-center"
          >
            <Icon size={16} />
            Log in with {label}
          </button>
        ))}
      </div>
    </main>
  );
}
