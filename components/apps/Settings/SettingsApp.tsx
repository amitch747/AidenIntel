'use client';
import { useAppSelector, useAppDispatch } from '@/state/hooks';

import {
  setProfile,
  toggleCursor,
  toggleBackseat,
  toggleFoul,
  toggleJump,
  togglePrivacy,
  toggleTime,
  toggleVoice,
  toggleWeb3,
  toggleWindow,
  changePersonality,
  changeStartup,
} from '@/state/slices/userSlice';

import { changeName } from '@/state/slices/userSlice';
import { useState } from 'react';
import { GrClose, GrLayer } from 'react-icons/gr';
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
          <button
            className={`settings-listbox-item ${
              userState.coolCursor ? 'selected' : ''
            }`}
            onClick={() => dispatch(toggleCursor(!userState.coolCursor))}
          >
            <GrClose />
            {/* ENABLE Cursor */}
            Cool Cursor
          </button>
          <button
            className={`settings-listbox-item ${
              userState.backseat ? 'selected' : ''
            }`}
            onClick={() => dispatch(toggleBackseat(!userState.backseat))}
          >
            <GrClose />
            {/* ENABLE Backseat */}
            BackSeat
          </button>
          <button
            className={`settings-listbox-item ${
              userState.privacy ? 'selected' : ''
            }`}
            onClick={() => dispatch(togglePrivacy(!userState.privacy))}
          >
            <GrClose />
            Privacy & Security
          </button>
          <button
            className={`settings-listbox-item ${
              userState.voice ? 'selected' : ''
            }`}
            onClick={() => dispatch(toggleVoice(!userState.voice))}
          >
            <GrClose />
            {/* ENABLE Voice */}
            The Voice
          </button>
          <button
            className={`settings-listbox-item ${
              userState.web3 ? 'selected' : ''
            }`}
            onClick={() => dispatch(toggleWeb3(!userState.web3))}
          >
            <GrClose />
            Web3
          </button>
          <button
            className={`settings-listbox-item ${
              userState.foul ? 'selected' : ''
            }`}
            onClick={() => dispatch(toggleFoul(!userState.foul))}
          >
            <GrClose />
            Foul Language
          </button>
          <button
            className={`settings-listbox-item ${
              userState.window ? 'selected' : ''
            }`}
            onClick={() => dispatch(toggleWindow(!userState.window))}
          >
            <GrClose />
            Intelligent Windows
          </button>
          <button
            className={`settings-listbox-item ${
              userState.time ? 'selected' : ''
            }`}
            onClick={() => dispatch(toggleTime(!userState.time))}
          >
            <GrClose />
            {/* RENDER Clock */}
            Mountain Time
          </button>
          <button
            className={`settings-listbox-item ${
              userState.jump ? 'selected' : ''
            }`}
            onClick={() => dispatch(toggleJump(!userState.jump))}
          >
            <GrClose />
            Jump Scares
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
          <h3>AI Voice:</h3>
          <select
            className="w95-input"
            style={{ width: '200px', marginBottom: '12px' }}
          >
            <option>Aiden</option>
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
