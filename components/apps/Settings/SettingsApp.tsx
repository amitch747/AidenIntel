'use client';
import { useAppSelector, useAppDispatch } from '@/state/hooks';

import { changeTheme, changeName } from '@/state/slices/userSlice';
import { useState } from 'react';
export default function SettingsApp() {
  const [userInput, setUserInput] = useState<string>('');

  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user);

  const handleSend = async () => {
    if (!userInput.trim()) return;
    try {
      await dispatch(
        changeName({
          id: userState.profile!.id,
          displayname: userInput,
        })
      );
    } catch (error) {
      console.error('Failed to update name', error);
    }
    setUserInput('');
  };

  return (
    <div className="settings  h-full">
      <div>
        <h1 className="text-xl font-bold mb-4">Theme</h1>
        <p className="mb-4">Selected theme: {userState.profile?.theme}</p>

        <div className="flex gap-2">
          <button
            className={`${userState.profile?.theme}-button`}
            onClick={() =>
              dispatch(changeTheme({ id: userState.profile!.id, theme: 'w95' }))
            }
          >
            w95
          </button>
          <button
            className={`vizda-button`}
            onClick={() =>
              dispatch(
                changeTheme({ id: userState.profile!.id, theme: 'vizda' })
              )
            }
          >
            vizda
          </button>
        </div>
      </div>
      <div>
        <h1 className="text-xl font-bold mb-4">User Display Name </h1>
        <div className="mb-4">
          User Display Name: {userState.profile?.displayname}
          <div className="flex gap-2 p-4 border-t bg-[#c0c0c0]">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Melvin"
              disabled={userState.updating}
              className="w95-input flex-1"
            />
            <button
              onClick={handleSend}
              disabled={userState.updating}
              className="w95-button"
            >
              {userState.updating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </div>
      <div>
        <h1 className="text-xl font-bold mb-4">Voice </h1>
        <p className="mb-4">Selected Voice: Aiden</p>
      </div>
      <div>
        <h1 className="text-xl font-bold mb-4">Personality </h1>
        <p className="mb-4">Selected Personality: Disinhbitied</p>
      </div>
    </div>
  );
}
