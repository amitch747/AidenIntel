'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppSelector } from '@/state/hooks';

export default function StartupScreen({ onDone }: { onDone: () => void }) {
  const [bootStarted, setBootStarted] = useState(false); // after first gesture
  const [hide, setHide] = useState(false); // start fade‑out
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    const startBoot = () => {
      setBootStarted(true);
      window.removeEventListener('click', startBoot);
      window.removeEventListener('keydown', startBoot);
    };
    window.addEventListener('click', startBoot);
    window.addEventListener('keydown', startBoot);
    return () => {
      window.removeEventListener('click', startBoot);
      window.removeEventListener('keydown', startBoot);
    };
  }, []);

  useEffect(() => {
    if (!bootStarted) return;

    const audio = new Audio(`/sounds/startup_${user.startup}.ogg`);
    audio.play().catch(() => {}); // gesture already happened
    audio.addEventListener('ended', () => setHide(true));

    return () => {
      audio.pause();
      audio.removeEventListener('ended', () => {});
    };
  }, [bootStarted]);

  return (
    <AnimatePresence>
      {!hide && (
        <motion.div
          key="boot-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          onAnimationComplete={() => hide && onDone()}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white select-none"
        >
          {!bootStarted && <div className="text-sm animate-pulse">Boot</div>}
          {bootStarted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }} // quick fade‑in after jingle starts
              className="flex items-center gap-4 mb-8"
            >
              {/* pixel‑art logo */}
              <motion.img
                src="/bogo.png"
                alt="Boot logo"
                style={{ imageRendering: 'pixelated' }}
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 0.5, opacity: 1 }}
                transition={{ duration: 3 }} // keep in sync with jingle if you like
              />

              {/* new label */}
              <motion.span
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: -150 }}
                transition={{ duration: 1.3, delay: 2 }}
                className="text-5xl whitespace-nowrap"
                style={{
                  imageRendering: 'pixelated',
                }} /* keeps sharp edges if you use a pixel font */
              >
                AidenIntelligence
              </motion.span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
