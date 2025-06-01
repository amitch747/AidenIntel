'use client';
import { useAppSelector, useAppDispatch } from '@/state/hooks';

import { changeTheme, changeName } from '@/state/slices/userSlice';
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
    <div className="h-full settings">
      <div className="settings-content">
        <div className="settings-section">
          <h3>Operating System Configuration:</h3>
          <div className="settings-listbox">
            <div className="settings-listbox-item">
              <span className="checkbox-icon checked"></span>
              Cool Cursor
            </div>
            <div className="settings-listbox-item">
              <span className="checkbox-icon checked"></span>
              Sound
            </div>
            <div className="settings-listbox-item">
              <span className="checkbox-icon checked"></span>
              Privacy & Security
            </div>
            <div className="settings-listbox-item">
              <span className="checkbox-icon"></span>
              Jump Scares
            </div>
            <div className="settings-listbox-item">
              <span className="checkbox-icon"></span>
              The Voice
            </div>
            <div className="settings-listbox-item selected">
              <span className="checkbox-icon"></span>
              Web3
            </div>
            <div className="settings-listbox-item selected">
              <span className="checkbox-icon"></span>
              Foul Language
            </div>
            <div className="settings-listbox-item selected">
              <span className="checkbox-icon"></span>
              Intelligent Windows
            </div>
            <div className="settings-listbox-item selected">
              <span className="checkbox-icon"></span>
              BackSeat
            </div>
            <div className="settings-listbox-item selected">
              <span className="checkbox-icon"></span>
              Mountain Time
            </div>
          </div>
        </div>

        <div className="settings-section flex">
          <div className="flex-1">
            <h3>AI Personality:</h3>
            <select
              className="w95-input"
              style={{ width: '200px', marginBottom: '12px' }}
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
            <div className="flex gap-2">
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
            >
              <option>Startup_Audio #1.wav</option>
              <option>Startup_Audio #2.wav</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

//  {
//    /* <div>
//         <h1 className="text-xl font-bold mb-4">Theme</h1>
//         <p className="mb-4">Selected theme: {userState.profile?.theme}</p>

//         <div className="flex gap-2">
//           <button
//             className={`${userState.profile?.theme}-button`}
//             onClick={() =>
//               dispatch(changeTheme({ id: userState.profile!.id, theme: 'w95' }))
//             }
//           >
//             w95
//           </button>
//           <button
//             className={`vizda-button`}
//             onClick={() =>
//               dispatch(
//                 changeTheme({ id: userState.profile!.id, theme: 'vizda' })
//               )
//             }
//           >
//             vizda
//           </button>
//         </div>
//       </div>
//       <div>
//         <h1 className="text-xl font-bold mb-4">User Display Name </h1>
//         <div className="mb-4">
//           User Display Name: {userState.profile?.displayname}
//           <div className="flex gap-2 p-4 border-t bg-[#c0c0c0]">

//           </div>
//         </div>
//       </div>
//       <div>
//         <h1 className="text-xl font-bold mb-4">Voice </h1>
//         <p className="mb-4">Selected Voice: Aiden</p>
//       </div>
//       <div>
//         <h1 className="text-xl font-bold mb-4">Personality </h1>
//         <p className="mb-4">Selected Personality: Disinhbitied</p>
//       </div> */
//  }
