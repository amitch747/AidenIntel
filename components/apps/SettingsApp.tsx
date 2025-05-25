import SettingsSideBar from './SettingsSideBar';

const theme = 'w95';

export default function SettingsApp() {
  return (
    <div className="grid grid-cols-[150px_1fr] h-full">
      <SettingsSideBar />
      <div>
        <h1 className="text-xl font-bold mb-4">Change theme</h1>
        <p className="mb-4">Current theme: {theme}</p>

        <div className="flex gap-2">
          <button
            className={`${theme}-button`}
            onClick={() => console.log('w95')}
          >
            w95
          </button>
          <button
            className={`vizda-button`}
            onClick={() => console.log('vizda')}
          >
            vizda
          </button>
        </div>
      </div>
    </div>
  );
}
