'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAppSelector, useAppDispatch } from '@/state/hooks';
import {
  deleteSession,
  renameSession,
  updateRenameInput,
  setIsRenaming,
  setRenameId,
} from '@/state/slices/chatSlice';

interface ToolTipSessionProps {
  left: number;
  top: number;
  setClickPos: React.Dispatch<
    React.SetStateAction<{ x: number; y: number } | null>
  >;
}

export default function ToolTipSession({
  top,
  left,
  setClickPos,
}: ToolTipSessionProps) {
  const dispatch = useAppDispatch();
  const { renameId, renameInput, isRenaming } = useAppSelector(
    (state) => state.chat
  );
  console.log('rename id', renameId);
  const ref = useRef<HTMLDivElement | null>(null);

  // Auto-close if clicking outside tooltip
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setClickPos(null);
        dispatch(setIsRenaming(false));
        dispatch(setRenameId(''));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    // Remove listener when ToolTipSession unmounts
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setClickPos]);

  const handleRenameSubmit = async () => {
    if (!renameInput.trim()) return;

    try {
      await dispatch(
        renameSession({ id: renameId, title: renameInput })
      ).unwrap();
      dispatch(setIsRenaming(false));
      dispatch(updateRenameInput(''));
      setClickPos(null); // close the tooltip after successful rename
      dispatch(setRenameId(''));
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };

  const handleDelete = async () => {
    try {
      // unwrap is NEEDED
      await dispatch(deleteSession(renameId)).unwrap();
      setClickPos(null);
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: top,
        left: left,
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
          className="w-full w95-input"
          placeholder="Enter new session title"
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
