import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './topbar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main className="px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
