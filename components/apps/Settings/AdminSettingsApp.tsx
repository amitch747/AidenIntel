'use client';
import { Profile } from '@/components/ClientApp';
export default function AdminSettingsApp({
  adminUserData,
}: {
  adminUserData: Profile;
}) {
  return (
    <div className="settings  h-full">
      <div>
        <h1 className="text-xl font-bold mb-4">Theme</h1>
        <p className="mb-4">Selected theme: {adminUserData.theme}</p>

        <div className="flex gap-2">
          <button className={`${adminUserData.theme}-button`}>w95</button>
          <button className={`vizda-button`}>vizda</button>
        </div>
      </div>
      <div>
        <h1 className="text-xl font-bold mb-4">User Display Name </h1>
        <div className="mb-4">
          User Display Name: {adminUserData.displayname}
          <div className="flex gap-2 p-4 border-t bg-[#c0c0c0]">
            <input
              type="text"
              value={adminUserData.displayname}
              placeholder="Melvin"
              className="w95-input flex-1"
              readOnly
            />
            <button className="w95-button"></button>
          </div>
        </div>
      </div>
      <div>
        <h1 className="text-xl font-bold mb-4">Voice </h1>
        <p className="mb-4">Selected Voice: Aiden</p>
      </div>
      <div>
        <h1 className="text-xl font-bold mb-4">Personality </h1>
        <p className="mb-4">Selected Personality: Disinhbitied</p>
      </div>
    </div>
  );
}
