'use client';
import { Rnd } from 'react-rnd';
import { WindowState } from '@/state/slices/desktopSlice';
import ChatApp from '@/components/apps/ChatApp';
import SettingsApp from '@/components/apps/SettingsApp';
import MusicApp from '@/components/apps/MusicApp';
import { GrClose, GrFormSubtract, GrLayer } from 'react-icons/gr';

import { useAppDispatch } from '@/state/hooks';
import {
  bringToFront,
  updateWindowBounds,
  toggleMax,
  toggleView,
  closeWindow,
} from '@/state/slices/desktopSlice';

const APP_COMPONENTS = {
  ChatApp,
  SettingsApp,
  MusicApp,
};

const theme = 'w95';

export default function Window({
  id,
  title,
  isMaximized,
  isMinimized,
  appName,
  position: { x, y, h, w },
  minDim: { xM, yM },
  zIndex,
}: WindowState) {
  const AppComponent = APP_COMPONENTS[appName as keyof typeof APP_COMPONENTS];
  const dispatch = useAppDispatch();

  return (
    <Rnd
      position={isMaximized ? { x: 0, y: 0 } : { x, y }}
      enableResizing={!isMaximized}
      size={
        isMaximized
          ? { width: '100%', height: '100%' }
          : { width: w, height: h }
      }
      bounds="parent"
      dragHandleClassName={`${theme}-titlebar`}
      minWidth={xM}
      minHeight={yM}
      style={{ zIndex: zIndex }}
      onDragStart={() => {
        dispatch(bringToFront(id));
      }}
      onResizeStart={() => {
        dispatch(bringToFront(id));
      }}
      onMouseDown={() => {
        dispatch(bringToFront(id));
      }}
      onDragStop={(e, d) => {
        dispatch(
          updateWindowBounds({
            id,
            position: { x: d.x, y: d.y },
          })
        );
      }}
      // no idea about some of these. should look into more
      onResizeStop={(e, dir, ref, delta, pos) => {
        dispatch(
          updateWindowBounds({
            id,
            position: { x: pos.x, y: pos.y },
            size: { w: ref.offsetWidth, h: ref.offsetHeight },
          })
        );
      }}
      className={`${theme}-window ${isMinimized ? 'minwindow' : ''} ${
        isMaximized ? 'animated' : ''
      }`}
    >
      <div className={`${theme}-titlebar`}>
        <span>{title}</span>
        <div className="titlebar-buttons">
          <button
            className={`${theme}-minimize`}
            title="Minimize"
            onClick={() => {
              dispatch(toggleView(id));
            }}
          >
            <GrFormSubtract />
          </button>
          <button
            className={`${theme}-maximize`}
            title="Maximize"
            onClick={() => {
              dispatch(toggleMax(id));
            }}
          >
            <GrLayer />
          </button>
          <button
            className={`${theme}-close`}
            title="Close"
            onClick={() => {
              dispatch(closeWindow(id));
            }}
          >
            <GrClose />
          </button>
        </div>
      </div>
      <div className={`${theme}-body`}>
        <AppComponent />
      </div>
    </Rnd>
  );
}
