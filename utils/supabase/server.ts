import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Make sure the logged-in Supabase user has a row in public.profiles.
 * Returns the existing or newly-created profile, or null if no user.
 */
export async function ensureProfile() {
  // 1️⃣  Get the Supabase server client that respects cookies
  const supabase = await createClient();

  // 2️⃣  Grab the current user (null if not signed in)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // not logged in

  // 3️⃣  Attempt to fetch existing profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile) return profile; // already exists

  // 4️⃣  Insert a default profile row (passes RLS because id = auth.uid())
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({ id: user.id }) // you can add default theme here
    .select()
    .single();

  if (error) throw error; // surface unexpected errors
  return newProfile;
}
