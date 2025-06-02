import { useAppSelector, useAppDispatch } from '@/state/hooks';
import { openWindow, toggleView } from '@/state/slices/desktopSlice';
import Time from './Time';
import LogoutButton from '@/components/LogoutButton';

export default function Taskbar() {
  const apps = useAppSelector((state) => state.desktop);
  const user = useAppSelector((state) => state.user);

  const dispatch = useAppDispatch();

  return (
    <div className={`w95-taskbar`}>
      <LogoutButton />

      {apps.map(({ id, appName, isOpen, isMinimized }) => (
        <button
          key={id}
          className={`w95-button ${
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
          {appName}
        </button>
      ))}
      <div
        className={`${user.time ? 'w95-time' : ''}`}
        style={{ position: 'absolute', right: '8px' }}
      >
        {user.time ? <Time /> : <></>}
      </div>
    </div>
  );
}
