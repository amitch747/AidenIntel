'use client';

import { useState } from 'react';
import { GrClose } from 'react-icons/gr';
import { UserState } from '@/state/slices/userSlice';
export default function AdminSettingsApp({
  adminUserData,
}: {
  adminUserData: UserState;
}) {
  const [userInput, setUserInput] = useState<string>('');

  return (
    <div className=" settings ">
      <div className="settings-section">
        <h3>Operating System Configuration:</h3>
        <div className="settings-listbox">
          <button
            className={`settings-listbox-item ${
              adminUserData.coolCursor ? 'selected' : ''
            }`}
          >
            <GrClose />
            {/* ENABLE Cursor */}
            Cool Cursor
          </button>
          <button
            className={`settings-listbox-item ${
              adminUserData.backseat ? 'selected' : ''
            }`}
          >
            <GrClose />
            {/* ENABLE Backseat */}
            BackSeat
          </button>
          <button
            className={`settings-listbox-item ${
              adminUserData.privacy ? 'selected' : ''
            }`}
          >
            <GrClose />
            Privacy & Security
          </button>
          <button
            className={`settings-listbox-item ${
              adminUserData.voice ? 'selected' : ''
            }`}
          >
            <GrClose />
            {/* ENABLE Voice */}
            The Voice
          </button>
          <button
            className={`settings-listbox-item ${
              adminUserData.web3 ? 'selected' : ''
            }`}
          >
            <GrClose />
            Web3
          </button>
          <button
            className={`settings-listbox-item ${
              adminUserData.window ? 'selected' : ''
            }`}
          >
            <GrClose />
            Intelligent Windows
          </button>
          <button
            className={`settings-listbox-item ${
              adminUserData.time ? 'selected' : ''
            }`}
          >
            <GrClose />
            {/* RENDER Clock */}
            Mountain Time
          </button>
        </div>
      </div>

      <div className="settings-section flex">
        <div className="flex-1">
          <h3>AI Personality:</h3>
          <select
            className="w95-input"
            style={{ width: '200px', marginBottom: '12px' }}
            value={adminUserData.personality}
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
              placeholder={adminUserData.profile?.displayname}
              className="w95-input"
              style={{ width: '150px' }}
              readOnly
            />
            <button className="w95-button" style={{ width: '50px' }}>
              {adminUserData.updating ? 'Updating' : 'Update'}
            </button>
          </div>
        </div>
        <div className="flex-1">
          <h3>Startup Audio:</h3>
          <select
            className="w95-input"
            style={{ width: '200px', marginBottom: '12px' }}
          >
            <option value={1}>Startup_Audio #1.wav</option>
            <option value={2}>Startup_Audio #2.wav</option>
          </select>
        </div>
      </div>
    </div>
  );
}
