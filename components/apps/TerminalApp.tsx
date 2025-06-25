'use client';
import { useState } from 'react';
import { useAppSelector } from '@/state/hooks';
export default function TerminalApp() {
  const [noAccess, toggleNoAcess] = useState<boolean>();
  const userState = useAppSelector((state) => state.user);

  const fakeInput = `AidenIntelligence AI-OS 95`;
  const error = '/sounds/error.mp3';
  const warning = () => {
    const audio = new Audio(error);
    audio.play().catch(console.error);
    setTimeout(() => {
      toggleNoAcess(true);

      setTimeout(() => {
        toggleNoAcess(false);
      }, 1000);
    }, 500);
  };
  return (
    <main className="terminal-container">
      <div className="terminal">
        <div className="terminal-input-box ">
          {fakeInput}
          <input
            type="text"
            onKeyDown={() => warning()}
            className="terminal-input flex-1"
            onChange={(e) => console.log(e)}
            value={`C:\\Users\\${userState.profile?.displayname}>  `}
            autoFocus
          />
        </div>
        {noAccess && (
          <div className="content-center justify-center text-7xl">
            NO ACCESS
          </div>
        )}
      </div>
    </main>
  );
}
