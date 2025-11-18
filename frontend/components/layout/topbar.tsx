'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function TopBar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
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
        {/* Left: Logo (mobile) */}
        <div className="lg:hidden">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
            Principle
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="ml-auto flex items-center gap-4">
          {/* Theme Toggle */}
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
