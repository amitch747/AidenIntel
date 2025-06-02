'use client';
import { useRef } from 'react';
import { createPortal } from 'react-dom';

interface AdminToolTipSessionProps {
  isRenaming: boolean;
  renameInput: string;
  toolTip: { left: number; top: number } | null;
}

export default function AdminToolTipSession({
  isRenaming,
  renameInput,
  toolTip,
}: AdminToolTipSessionProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: toolTip?.top,
        left: toolTip?.left,
        zIndex: 9000,
        backgroundColor: '#c0c0c0',
      }}
    >
      {!isRenaming ? (
        <button className="w95-button">Rename</button>
      ) : (
        <input
          type="text"
          className="w95-input"
          placeholder="Session Title"
          value={renameInput}
          autoFocus
          readOnly
        />
      )}
      <button className="w95-button w-full">Delete</button>
    </div>,
    document.body
  );
}
