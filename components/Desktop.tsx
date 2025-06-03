'use client';

import TaskBar from '@/components/Taskbar';
import { useAppSelector, useAppDispatch } from '@/state/hooks';
import Window from './Window';

import { useEffect } from 'react';
import {
  changeName,
  setProfile,
  toggleAdmin,
  toggleBackseat,
  toggleCursor,
  toggleTime,
  toggleVoice,
  toggleWeb3,
  toggleWindow,
} from '@/state/slices/userSlice';
import { supabase } from '@/utils/supabase/client';
import { Profile } from './ClientApp';
import {
  setCurrentSession,
  postMessage,
  createSession,
  deleteSession,
  updateUserInput,
  renameSession,
  setIsThinking,
} from '@/state/slices/chatSlice';
import {
  openWindow,
  closeWindow,
  updateWindowBounds,
  toggleMax,
  toggleView,
} from '@/state/slices/desktopSlice';

import Backseat from './Backseat';

export default function Desktop({ profile }: { profile: Profile }) {
  // Get state for broadcasts
  const desktopState = useAppSelector((state) => state.desktop);
  const chatState = useAppSelector((state) => state.chat);
  const userState = useAppSelector((state) => state.user);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (profile.is_admin) return;

    const presenceRoom = supabase.channel('presence');
    presenceRoom
      .on('broadcast', { event: 'admin_status' }, (payload) => {
        const { status } = payload.payload;
        if (status === 'online') {
          dispatch(toggleAdmin(true));
        } else if (status === 'offline') {
          dispatch(toggleAdmin(false));
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user presence
          await presenceRoom.track({
            id: profile.id,
            is_admin: profile.is_admin,
            displayname: profile.displayname,
            theme: profile.theme,
            last_online: profile.last_online,
          });

          // Request current admin status
          await presenceRoom.send({
            type: 'broadcast',
            event: 'request_admin_status',
            payload: { requesting_user: profile.id },
          });
        }
      });

    return () => {
      presenceRoom.unsubscribe();
    };
  }, [profile, dispatch]);

  useEffect(() => {
    // Finally set profile in store so the drilling may end
    dispatch(setProfile(profile));
  }, [profile, dispatch]);

  useEffect(() => {
    // Set up unique user channel
    const userChannel = supabase.channel(`user-${userState.profile?.id}`);

    userChannel
      .on('broadcast', { event: 'admin-request-state' }, async () => {
        // Send state when admin requests it
        await userChannel.send({
          type: 'broadcast',
          event: 'desktop-state',
          payload: {
            windows: desktopState,
            chat: chatState,
            user: userState,
          },
        });
      })

      .on('broadcast', { event: 'admin-control' }, async (payload) => {
        // Respond to admin broadcasts
        const { command, data } = payload.payload;

        switch (command) {
          case 'TOGGLE_THINKING':
            dispatch(setIsThinking(data.thinking));
            break;

          case 'SELECT_SESSION':
            dispatch(setCurrentSession(data.sessionId));
            break;
          case 'CREATE_SESSION':
            try {
              const result = await dispatch(createSession()).unwrap();
              dispatch(setCurrentSession(result.id));
            } catch (error) {
              console.error('Failed to create session:', error);
            }
            break;
          case 'DELETE_SESSION':
            try {
              await dispatch(deleteSession(data.sessionId)).unwrap();
            } catch (error) {
              console.error('Failed to delete session:', error);
            }
            break;
          case 'RENAME_SESSION':
            try {
              await dispatch(
                renameSession({
                  id: data.sessionId,
                  title: data.name,
                })
              ).unwrap();
            } catch (error) {
              console.error('Failed to rename session:', error);
            }
            break;
          case 'UPDATE_WINDOW_BOUNDS':
            dispatch(
              updateWindowBounds({
                id: data.windowId,
                position: {
                  x: data.x,
                  y: data.y,
                  w: data.w,
                  h: data.h,
                },
              })
            );
            await userChannel.send({
              type: 'broadcast',
              event: 'window-live-update',
              payload: {
                windowId: data.windowId,
                position: {
                  x: data.x,
                  y: data.y,
                  w: data.w,
                  h: data.h,
                },
                timestamp: Date.now(),
              },
            });
            break;
          case 'SEND_MESSAGE':
            try {
              await dispatch(
                postMessage({
                  sessionId: data.sessionId,
                  message: data.message,
                  isAdmin: true,
                })
              ).unwrap();
            } catch (error) {
              console.error('Failed to send admin message:', error);
            }
            break;

          case 'SEND_HEADER':
            try {
              await dispatch(
                postMessage({
                  sessionId: data.sessionId,
                  message: data.message,
                  isAdmin: true,
                  isHeader: true,
                })
              ).unwrap();
            } catch (error) {
              console.error('Failed to send admin message:', error);
            }
            break;

          case 'UPDATE_USER_INPUT':
            dispatch(updateUserInput(data.input));
            break;

          case 'OPEN_APP':
            dispatch(openWindow(data.windowId));
            break;

          case 'CLOSE_APP':
            dispatch(closeWindow(data.windowId));
            break;
          case 'MIN_APP':
            dispatch(toggleView(data.windowId));
            break;
          case 'MAX_APP':
            dispatch(toggleMax(data.windowId));
            break;

          case 'RENAME_USER': {
            const { userId, input } = data;
            if (!input?.trim()) break;

            try {
              await dispatch(
                changeName({
                  id: userId,
                  displayname: input.trim(),
                })
              ).unwrap(); // optional but lets you catch errors
            } catch (err) {
              console.error('Failed to rename user:', err);
            }
            break;
          }

          case 'CURSOR':
            dispatch(toggleCursor(data.toggle));
            break;
          case 'BACK':
            dispatch(toggleBackseat(data.toggle));
            break;
          case 'VOICE':
            dispatch(toggleVoice(data.toggle));
            break;
          case 'WEB3':
            dispatch(toggleWeb3(data.toggle));
            break;
          case 'WINDOW':
            dispatch(toggleWindow(data.toggle));
            break;
          case 'TIME':
            dispatch(toggleTime(data.toggle));
            break;
        }
      })
      .subscribe(async (status) => {
        // Also send state when admin subscribes (maybe not needed)
        if (status === 'SUBSCRIBED') {
          await userChannel.send({
            type: 'broadcast',
            event: 'desktop-state',
            payload: {
              windows: desktopState,
              chat: chatState,
              user: userState,
            },
          });
        }
      });

    return () => {
      // Unsub when component dismounts
      userChannel.unsubscribe();
    };
  }, [desktopState, chatState, userState, dispatch]);

  useEffect(() => {
    if (userState.coolCursor) {
      document.documentElement.classList.add('cool-cursor');
    } else {
      document.documentElement.classList.remove('cool-cursor');
    }
  }, [userState.coolCursor]);

  const openApps = desktopState.filter((app) => app.isOpen);
  return (
    <>
      <main className="w95-desktop">
        {/* AI Online Indicator */}
        {userState.admin_online && (
          <div className="ai-online-indicator">
            <div className="ai-status-light"></div>
            <span>AI Online</span>
          </div>
        )}
        {!userState.admin_online && (
          <div className="ai-online-indicator">
            <span>AI Offline</span>
          </div>
        )}

        {openApps.map((app) => (
          <Window key={app.id} {...app} dispatch={dispatch} />
        ))}
      </main>
      <Backseat />
      <TaskBar />
    </>
  );
}
