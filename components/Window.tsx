'use client';
import { Rnd } from 'react-rnd';
import { WindowState } from '@/state/slices/desktopSlice';
import { ChatState } from '@/state/slices/chatSlice';
import ChatApp from '@/components/apps/Chat/ChatApp';
import AdminChatApp from '@/components/apps/Chat/AdminChatApp';
import SettingsApp from '@/components/apps/Settings/SettingsApp';
import AdminSettingsApp from './apps/Settings/AdminSettingsApp';
import { GrClose, GrFormSubtract, GrLayer } from 'react-icons/gr';
import { AppDispatch } from '@/state/store';
import TerminalApp from './apps/TerminalApp';

import {
  bringToFront,
  updateWindowBounds,
  toggleMax,
  toggleView,
  closeWindow,
} from '@/state/slices/desktopSlice';
import { UserState } from '@/state/slices/userSlice';

const APP_COMPONENTS = {
  ChatApp,
  SettingsApp,
  TerminalApp,
};

const theme = 'w95';

interface WindowProps extends WindowState {
  adminChatData?: ChatState;
  adminUserData?: UserState;
  isAdminView?: boolean;
  dispatch?: AppDispatch; // Optional dispatch
}

export default function Window({
  id,
  title,
  isMaximized,
  isMinimized,
  appName,
  position: { x, y, h, w },
  minDim: { xM, yM },
  zIndex,
  adminChatData,
  adminUserData,
  isAdminView = false,
  dispatch,
}: WindowProps) {
  // Cool trick to get dynamic access to components
  const AppComponent = APP_COMPONENTS[appName as keyof typeof APP_COMPONENTS];

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
        if (!isAdminView && dispatch) {
          dispatch(bringToFront(id));
        }
      }}
      onResizeStart={() => {
        if (!isAdminView && dispatch) {
          dispatch(bringToFront(id));
        }
      }}
      onMouseDown={() => {
        if (!isAdminView && dispatch) {
          dispatch(bringToFront(id));
        }
      }}
      onDragStop={(e, d) => {
        if (!isAdminView && dispatch) {
          dispatch(
            updateWindowBounds({
              id,
              position: {
                x: d.x,
                y: d.y,
              },
            })
          );
        }
      }}
      onResizeStop={(e, dir, ref, delta, pos) => {
        if (!isAdminView && dispatch) {
          dispatch(
            updateWindowBounds({
              id,
              position: {
                x: pos.x,
                y: pos.y,
                w: ref.offsetWidth,
                h: ref.offsetHeight,
              },
            })
          );
        }
      }}
      className={`${theme}-window ${isMinimized ? 'minwindow' : ''}`}
    >
      <div className={`${theme}-titlebar`}>
        <span>
          {title} {isAdminView && '(Admin View)'}
        </span>
        <div className="titlebar-buttons">
          <button
            className={`${theme}-minimize`}
            onClick={() => {
              if (!isAdminView && dispatch) {
                dispatch(toggleView(id));
              }
            }}
            disabled={isAdminView}
          >
            <GrFormSubtract />
          </button>
          <button
            className={`${theme}-maximize`}
            onClick={() => {
              if (!isAdminView && dispatch) {
                dispatch(toggleMax(id));
              }
            }}
            disabled={isAdminView}
          >
            <GrLayer />
          </button>
          <button
            className={`w95-close`}
            onClick={() => {
              if (!isAdminView && dispatch) {
                dispatch(closeWindow(id));
              }
            }}
            disabled={isAdminView}
          >
            <GrClose />
          </button>
        </div>
      </div>

      {/* Admin version rendered if adminView */}
      {appName === 'ChatApp' ? (
        isAdminView && adminChatData ? (
          <AdminChatApp userChatState={adminChatData} />
        ) : (
          <ChatApp />
        )
      ) : appName === 'SettingsApp' ? (
        isAdminView && adminUserData ? (
          <AdminSettingsApp adminUserData={adminUserData} />
        ) : (
          <SettingsApp />
        )
      ) : (
        <AppComponent />
      )}
    </Rnd>
  );
}
