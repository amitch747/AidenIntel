'use client';
import TaskBar from '@/components/Taskbar';
import { useAppSelector, useAppDispatch } from '@/state/hooks';
import Window from './Window';
import { useEffect } from 'react';
import { setProfile } from '@/state/slices/userSlice';
import { supabase } from '@/utils/supabase/client';
import { UUID } from 'crypto';
import {
  setCurrentSession,
  postMessage,
  createSession,
  deleteSession,
  updateUserInput,
} from '@/state/slices/chatSlice';
import {
  openWindow,
  closeWindow,
  updateWindowBounds,
} from '@/state/slices/desktopSlice';

type Profile = {
  id: UUID;
  theme: string;
  displayname: string;
  is_admin: boolean;
};

export default function Desktop({ profile }: { profile: Profile }) {
  const apps = useAppSelector((state) => state.desktop);
  const chatState = useAppSelector((state) => state.chat);
  const openApps = apps.filter((app) => app.isOpen);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setProfile(profile));
  }, [profile, dispatch]);

  useEffect(() => {
    const userChannel = supabase.channel(`user-${profile.id}`);

    userChannel
      .on('broadcast', { event: 'admin-request-state' }, async () => {
        // Send current state when admin requests it
        await userChannel.send({
          type: 'broadcast',
          event: 'desktop-state',
          payload: {
            windows: apps,
            chat: chatState,
            userId: profile.id,
          },
        });
      })
      .on('broadcast', { event: 'admin-control' }, async (payload) => {
        const { command, data } = payload.payload;
        console.log('🎮 User received admin command:', command, data);

        // Execute the admin's command
        switch (command) {
          case 'SELECT_SESSION':
            dispatch(setCurrentSession(data.sessionId));
            break;

          case 'SEND_MESSAGE':
            try {
              await dispatch(
                postMessage({
                  sessionId: data.sessionId,
                  message: data.message,
                  isAdmin: true, // Mark as admin message
                })
              ).unwrap();
            } catch (error) {
              console.error('Failed to send admin message:', error);
            }
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

          case 'UPDATE_USER_INPUT':
            dispatch(updateUserInput(data.input));
            break;

          case 'MOVE_WINDOW':
            dispatch(
              updateWindowBounds({
                id: data.windowId,
                position: { x: data.x, y: data.y },
              })
            );
            break;

          case 'OPEN_APP':
            dispatch(openWindow(data.windowId));
            break;

          case 'CLOSE_APP':
            dispatch(closeWindow(data.windowId));
            break;

          default:
            console.log('Unknown admin command:', command);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Send state when user channel first connects
          await userChannel.send({
            type: 'broadcast',
            event: 'desktop-state',
            payload: {
              windows: apps,
              chat: chatState,
              userId: profile.id,
            },
          });
        }
      });

    return () => {
      userChannel.unsubscribe();
    };
  }, [apps, chatState, profile.id, dispatch]);

  return (
    <main className="w95-desktop">
      {openApps.map((app) => (
        <Window key={app.id} {...app} />
      ))}
      <TaskBar />
    </main>
  );
}
