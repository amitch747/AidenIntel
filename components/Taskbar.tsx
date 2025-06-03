import { useAppSelector, useAppDispatch } from '@/state/hooks';
import { openWindow, toggleView } from '@/state/slices/desktopSlice';
import Time from './Time';
import { useState, useRef } from 'react';
import ToolTipStart from './ToolTipStart';
import Image from 'next/image';

export default function Taskbar() {
  const apps = useAppSelector((state) => state.desktop);
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const [showStart, setShowStart] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement>(null);

  const toggleStart = () => {
    setShowStart(!showStart);
  };

  // Only handle start button clicks - let ToolTipStart handle outside clicks
  // No click outside handler needed here since ToolTipStart handles it

  return (
    <div className={`w95-taskbar flex justify-between items-center`}>
      <div className="flex-none">
        <button
          ref={startButtonRef}
          className="w95-button-logo p-1 w-[40px] h-[29px] flex items-center justify-center "
          onClick={toggleStart}
        >
          <Image src="/vogo.png" alt="logo" width={100} height={90} />
        </button>
        {showStart && <ToolTipStart setShowStart={setShowStart} />}
      </div>

      <div className="flex justify-center flex-1 gap-2">
        {apps.map(({ id, title, isOpen, isMinimized }) => (
          <button
            key={id}
            className={`w95-button flex items-center gap-2 ${
              isOpen ? `${!isMinimized ? 'active' : 'minimized'}` : ''
            }`}
            onClick={() => {
              if (isOpen) {
                dispatch(toggleView(id));
              } else {
                dispatch(openWindow(id));
              }
            }}
          >
            {title === 'AidenIntelligence' && (
              <Image
                src="/AI2.png"
                alt="logo"
                width={16}
                height={16}
                className="flex-shrink-0"
              />
            )}

            <span>{title}</span>
          </button>
        ))}
      </div>

      <div className={`w-15 ${user.time ? 'w95-time' : ''}`}>
        {user.time ? <Time /> : <div></div>}
      </div>
    </div>
  );
}
