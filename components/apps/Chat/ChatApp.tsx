// 'use client';
// import { useState } from 'react';
// import SessionList from './SessionList';
// import Chat from './Chat';

// export default function ChatApp() {
//   const [currentSessionId, setCurrentSessionId] = useState<string>('');

//   return (
//     <div className="chat-interface h-full p-2 pb-6.5 box-border">
//       <div className="sessions-panel">
//         <SessionList
//           currentSessionId={currentSessionId}
//           onSessionSelect={setCurrentSessionId}
//         />
//       </div>
//       <div className="chat-panel">
//         <Chat session_id={currentSessionId} />
//       </div>
//     </div>
//   );
// }

'use client';

import SessionList from './SessionList';
import Chat from './Chat';

export default function ChatApp() {
  return (
    <div className="chat-interface h-full p-2 pb-6.5 box-border">
      <div className="sessions-panel">
        <SessionList />
      </div>
      <div className="chat-panel">
        <Chat />
      </div>
    </div>
  );
}
