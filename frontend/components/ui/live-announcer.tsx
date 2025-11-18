'use client';

import { useEffect, useState } from 'react';

let announceTimeout: NodeJS.Timeout;

export function LiveAnnouncer() {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    // Make the announce function globally available
    (window as any).announce = (message: string) => {
      clearTimeout(announceTimeout);
      setAnnouncement(message);

      // Clear the announcement after 1 second to allow for multiple announcements
      announceTimeout = setTimeout(() => {
        setAnnouncement('');
      }, 1000);
    };

    return () => {
      clearTimeout(announceTimeout);
    };
  }, []);

  if (!announcement) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

// Usage example in other components:
// (window as any).announce?.('Portfolio value updated to $125,432');
