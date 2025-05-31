'use client';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  deleteSession,
  renameSession,
  updateRenameInput,
  setIsRenaming,
  setRenameId,
  setToolTip,
} from '@/state/slices/chatSlice';

export default function ToolTipSession() {
  const dispatch = useAppDispatch();
  const { renameId, renameInput, isRenaming, toolTip } = useAppSelector(
    (state) => state.chat
  );

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        dispatch(setIsRenaming(false));
        dispatch(setRenameId(''));
        dispatch(setToolTip(null));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [toolTip, dispatch]);

  const handleRenameSubmit = async () => {
    if (!renameInput.trim()) return;

    try {
      await dispatch(
        renameSession({ id: renameId, title: renameInput })
      ).unwrap();
      dispatch(setIsRenaming(false));
      dispatch(updateRenameInput(''));
      dispatch(setToolTip(null));
      dispatch(setRenameId(''));
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteSession(renameId)).unwrap();
      dispatch(setToolTip(null));
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: toolTip?.top,
        left: toolTip?.left,
        zIndex: 9999,
      }}
    >
      {!isRenaming ? (
        <button
          className="w95-button"
          onClick={() => dispatch(setIsRenaming(true))}
        >
          Rename
        </button>
      ) : (
        <input
          type="text"
          className="w95-input"
          placeholder="Session Title"
          value={renameInput}
          onChange={(e) => dispatch(updateRenameInput(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRenameSubmit();
            if (e.key === 'Escape') dispatch(setIsRenaming(false));
          }}
          maxLength={10}
          autoFocus
        />
      )}
      <button onClick={() => handleDelete()} className="w95-button w-full">
        Delete
      </button>
    </div>,
    document.body
  );
}
