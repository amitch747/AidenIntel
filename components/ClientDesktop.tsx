'use client';
import { Provider } from 'react-redux';
import { store } from '@/state/store';
import Desktop from '@/components/Desktop';

type Profile = {
  displayname?: string;
};

export default function ClientDesktop({ profile }: { profile: Profile }) {
  return (
    <Provider store={store}>
      <Desktop profile={profile} />
    </Provider>
  );
}
