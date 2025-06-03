'use client';

import { supabase } from '@/utils/supabase/client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Provider } from '@supabase/supabase-js';
import { FaGithub, FaDiscord } from 'react-icons/fa';
import { Rnd } from 'react-rnd';
import { useState } from 'react';

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
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const size = { width: 300, height: 130 };
  const router = useRouter();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/');
    });
  }, [router]);

  // Sign in with supabase auth then redirect
  async function signIn(provider: Provider) {
    console.log('Current URL:', window.location.href);
    console.log('Origin:', window.location.origin);

    const redirectTo = window.location.origin;
    console.log('Redirect URL being sent:', redirectTo);

    const base = { redirectTo };
    // Skip the consent page for Discord once the user has approved scopes
    const options =
      provider === 'discord'
        ? { ...base, queryParams: { prompt: 'none' } }
        : base; // GitHub works fine with the default

    await supabase.auth.signInWithOAuth({ provider, options });
  }

  return (
    <main className="w95-login">
      <Rnd
        minWidth={220}
        minHeight={100}
        className="w95-window"
        bounds="parent"
        dragHandleClassName={`w95-titlebar`}
        position={position}
        size={size}
        onDragStop={(e, d) => {
          setPosition({ x: d.x, y: d.y });
        }}
        enableResizing={false}
      >
        <div className="w95-titlebar">
          <span>Welcome to AidenIntelligence</span>
        </div>

        <p className="text-sm ml-2">Please Login Now</p>
        <div className="flex flex-col justify-center items-center p-4">
          {providers.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => signIn(id)}
              className="w95-button mb-2 w-[150px]"
            >
              <Icon size={16} />
              Login with {label}
            </button>
          ))}
        </div>
      </Rnd>
    </main>
  );
}
