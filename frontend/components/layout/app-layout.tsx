'use client';

import { useState } from 'react';
import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './topbar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <Sidebar isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="lg:pl-64">
        <TopBar onMenuToggle={() => setMobileNavOpen(true)} />
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
