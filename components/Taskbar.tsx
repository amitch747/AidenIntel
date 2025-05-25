import { useAppSelector, useAppDispatch } from '@/state/hooks';
import { openWindow, toggleView } from '@/state/slices/desktopSlice';
import '@/styles/globals.css';
import LogoutButton from '@/components/LogoutButton';

const theme = 'w95';

export default function Taskbar() {
  const apps = useAppSelector((state) => state.desktop);
  const dispatch = useAppDispatch();

  return (
    <div className={`${theme}-taskbar`}>
      {apps.map(({ id, appName, isOpen, isMinimized }) => (
        <button
          key={id}
          className={`${theme}-button ${
            isOpen ? `${!isMinimized ? 'active' : 'minimized'}` : ''
          }`}
          onClick={() => {
            isOpen ? dispatch(toggleView(id)) : dispatch(openWindow(id));
          }}
        >
          {appName}
        </button>
      ))}
      <LogoutButton />
    </div>
  );
}
