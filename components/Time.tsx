'use client';

import { useEffect, useState } from 'react';

export default function MountainClock() {
  // 12‑hour formatter for America/Edmonton
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Edmonton',
    hour: 'numeric', // 1‑12
    minute: '2-digit',
    hour12: true,
  });

  // initial render
  const [time, setTime] = useState<string>(() => fmt.format(new Date()));

  useEffect(() => {
    const update = () => setTime(fmt.format(new Date()));

    // Align the first tick to the next minute boundary
    const now = new Date();
    const msUntilNextMinute =
      60_000 - (now.getSeconds() * 1000 + now.getMilliseconds());

    // first: wait until the next minute starts …
    const firstTimeout = setTimeout(() => {
      update(); // update exactly on the boundary

      // … then tick every 60 s
      const interval = setInterval(update, 60_000);

      // tidy up if component unmounts after interval starts
      return () => clearInterval(interval);
    }, msUntilNextMinute);

    // tidy up if component unmounts before first tick
    return () => clearTimeout(firstTimeout);
  }, []);

  return <div>{time}</div>;
}
