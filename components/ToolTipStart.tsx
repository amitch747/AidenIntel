'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Dispatch, SetStateAction } from 'react';
import LogoutButton from '@/components/LogoutButton';

export default function ToolTipStart({
  setShowStart,
}: {
  setShowStart: Dispatch<SetStateAction<boolean>>;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  // Start slide-up animation when component mounts
  useEffect(() => {
    setIsAnimating(true);
  }, []);

  // Handle click outside (including start button for toggle behavior)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        // Start slide-down animation
        setIsAnimating(false);

        // Wait for animation to complete before unmounting
        setTimeout(() => {
          setShowStart(false);
        }, 500); // Match the CSS transition duration
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowStart]);

  return createPortal(
    <div
      ref={ref}
      className="w95-window flex-col"
      style={{
        position: 'fixed',
        bottom: '33px',
        left: '0px',
        zIndex: 9999,
        backgroundColor: '#c0c0c0',
        border: '4px outset #c0c0c0',
        padding: '2px',
        minWidth: '150px',
        maxWidth: '200px',
        boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        fontSize: '13px',
        // Animation styles
        transform: `translateY(${isAnimating ? '0' : '100%'})`,
        opacity: isAnimating ? 1 : 0,
        transition: 'transform 0.5s ease-out',
      }}
    >
      <h1 className="text-2xl items-center justify-center text-center">
        AidenIntelligence V1.0.1
      </h1>
      <p>
        AidenIntelligence is the world's first agentic operating system. AI has
        complete control of everything on your desktop and inside of your apps.
        Open up the chat and say something.
      </p>
      <LogoutButton />
    </div>,
    document.body
  );
}
