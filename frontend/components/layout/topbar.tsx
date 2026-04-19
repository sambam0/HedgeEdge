'use client';

import { Menu, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between">
        {/* Left: hamburger (mobile) + logo (mobile) */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Principle</h1>
        </div>

        {/* Right: theme toggle */}
        <div className="ml-auto flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
