'use client';
import { Rnd } from 'react-rnd';
import { useState, useEffect, useCallback } from 'react';
import messages from './Backseat.json';
import { TypewriterText } from './TypewriterText';
import { useAppSelector } from '@/state/hooks';

export default function Backseat() {
  const { backseat, voice, web3, jump } = useAppSelector((state) => state.user);

  const getRandomMessage = useCallback(() => {
    let messagePool = [...messages.standard];

    if (jump) {
      messagePool = [...messagePool, ...messages.jump];
    }

    if (web3) {
      messagePool = [...messagePool, ...messages.web3];
    }

    const randomIndex = Math.floor(Math.random() * messagePool.length);
    return messagePool[randomIndex]; // Return entire object, not just content
  }, [jump, web3]);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState({
    content: '',
    audio: '',
  });

  const playMessageWithAudio = (messageObj: {
    content: string;
    audio: string;
  }) => {
    // Play audio
    if (voice) {
      const audio = new Audio(messageObj.audio);
      audio.play().catch(console.error); // Handle audio errors gracefully
    }

    // Show text
    setCurrentMessage(messageObj);
    setIsVisible(true);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const startCycle = () => {
      // 30 second cooldown
      timer = setTimeout(() => {
        // Random delay within 30 seconds (0-30 seconds)
        const randomDelay = Math.random() * 30000;

        timer = setTimeout(() => {
          playMessageWithAudio(getRandomMessage());

          // Hide after 20 seconds, then restart cycle
          timer = setTimeout(() => {
            setIsVisible(false);
            startCycle();
          }, 15000);
        }, randomDelay);
      }, 30000);
    };

    if (backseat) {
      startCycle();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [backseat, getRandomMessage, playMessageWithAudio]);

  if (!backseat || !isVisible) {
    return null;
  }

  return (
    <Rnd
      bounds="parent"
      position={position}
      size={{ width: 300, height: 157 }}
      dragHandleClassName="w95-titlebar"
      enableResizing={false}
      style={{ zIndex: 9990 }}
      onDragStop={(e, d) => {
        setPosition({ x: d.x, y: d.y });
      }}
      className="w95-window"
    >
      <div className="w95-titlebar">
        <span>BackSeat</span>
      </div>
      <div className="flex items-start gap-2">
        <div className="backseat-wow flex-shrink-0" />
        <div className="flex-1 text-black text-sm pr-2">
          <TypewriterText text={currentMessage.content} />
        </div>
      </div>
    </Rnd>
  );
}
