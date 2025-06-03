'use client';
import { useAppSelector, useAppDispatch } from '@/state/hooks';

import {
  setProfile,
  toggleBackseat,
  toggleFoul,
  toggleJump,
  toggleTime,
  toggleVoice,
  toggleWeb3,
  toggleWindow,
  changePersonality,
  changeStartup,
} from '@/state/slices/userSlice';

import { changeName } from '@/state/slices/userSlice';
import Image from 'next/image';
import { useState } from 'react';
export default function SettingsApp() {
  const [userInput, setUserInput] = useState<string>('');

  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user);

  const handleSend = async () => {
    if (!userInput.trim()) return;
    try {
      await dispatch(
        changeName({
          id: userState.profile!.id,
          displayname: userInput,
        })
      );
    } catch (error) {
      console.error('Failed to update name', error);
    }
    setUserInput('');
  };

  return (
    <div className=" settings ">
      <div className="settings-section">
        <h3>Operating System Configuration:</h3>
        <div className="settings-listbox">
          {/* <button
            className={`settings-listbox-item ${
              userState.coolCursor ? 'selected' : ''
            }`}
            onClick={() => dispatch(toggleCursor(!userState.coolCursor))}
          >
            <GrClose />
            ENABLE Cursor
            Cool Cursor
          </button> */}

          <button
            className={`settings-listbox-item ${
              userState.time ? 'selected' : ''
            }`}
            onClick={() => dispatch(toggleTime(!userState.time))}
          >
            <Image
              src={'/mountain.png'}
              alt="backseat"
              width={32}
              height={32}
              className="pixelated"
            />
            {/* RENDER Clock */}
            Mountain Time
          </button>
          <button
            className={` settings-listbox-item ${
              userState.privacy ? 'selected' : ''
            }`}
          >
            <Image
              src={'/key.png'}
              alt="backseat"
              width={32}
              height={32}
              className="pixelated content-center justify-center"
            />
            Privacy & Security
          </button>
          <button
            className={`settings-listbox-item ${
              userState.web3 ? 'selected' : ''
            }`}
            onClick={() => dispatch(toggleWeb3(!userState.web3))}
          >
            <Image
              src={'/3.png'}
              alt="backseat"
              width={32}
              height={32}
              className="pixelated"
            />
            Web3
          </button>
          <button
            className={`settings-listbox-item ${
              userState.window ? 'selected' : ''
            }`}
            onClick={() => dispatch(toggleWindow(!userState.window))}
          >
            <Image
              src={'/brain.png'}
              alt="backseat"
              width={32}
              height={32}
              className="pixelated"
            />
            Intelligent Windows
          </button>

          <button
            className={`settings-listbox-item ${
              userState.voice ? 'selected' : ''
            }`}
            onClick={() => dispatch(toggleVoice(!userState.voice))}
          >
            <Image
              src={'/voice.png'}
              alt="backseat"
              width={32}
              height={32}
              className="pixelated content-center justify-center"
            />
            {/* ENABLE Voice */}
            The Voice
          </button>
          <button
            className={`settings-listbox-item ${
              userState.backseat ? 'selected' : ''
            }`}
            onClick={() => dispatch(toggleBackseat(!userState.backseat))}
          >
            <Image
              src={'/backseat.png'}
              alt="backseat"
              width={32}
              height={32}
              className="pixelated"
            />
            {/* ENABLE Backseat */}
            BackSeat
          </button>
          <button
            className={`settings-listbox-item ${
              userState.jump ? 'selected' : ''
            }`}
            onClick={() => dispatch(toggleJump(!userState.jump))}
          >
            <Image
              src={'/speed.png'}
              alt="jump"
              width={32}
              height={32}
              className="pixelated"
            />
            {/* ENABLE Backseat */}
            JumpScares
          </button>
        </div>
      </div>

      <div className="settings-section flex">
        <div className="flex-1">
          <h3>AI Personality:</h3>
          <select
            className="w95-input"
            style={{ width: '200px', marginBottom: '12px' }}
            value={userState.personality}
            onChange={(e) =>
              dispatch(
                changePersonality(
                  e.target.value as 'Regular' | 'Petulant' | 'Unintelligible'
                )
              )
            }
          >
            <option>Regular</option>
            <option>Petulant</option>
            <option>Unintelligible</option>
          </select>
        </div>
        <div className="flex-1">
          <h3>BackSeat Voice:</h3>
          <select
            className="w95-input"
            style={{ width: '200px', marginBottom: '12px' }}
          >
            <option>Default</option>
          </select>
        </div>
      </div>

      <div className="settings-section flex">
        <div className="flex-1">
          <h3>Display Name:</h3>
          <div className="flex gap-1">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={userState.profile?.displayname}
              disabled={userState.updating}
              className="w95-input"
              style={{ width: '150px' }}
            />
            <button
              onClick={handleSend}
              disabled={userState.updating}
              className="w95-button"
              style={{ width: '50px' }}
            >
              {userState.updating ? 'Updating' : 'Update'}
            </button>
          </div>
        </div>
        <div className="flex-1">
          <h3>Startup Audio:</h3>
          <select
            className="w95-input"
            style={{ width: '200px', marginBottom: '12px' }}
            value={userState.startup}
            onChange={(e) => dispatch(changeStartup(Number(e.target.value)))}
          >
            <option value={1}>Startup_Audio #1.wav</option>
            <option value={2}>Startup_Audio #2.wav</option>
          </select>
        </div>
      </div>
    </div>
  );
}
