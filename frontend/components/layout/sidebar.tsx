'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Search,
  Star,
  Globe2,
  BarChart3,
  Newspaper,
  Settings,
} from 'lucide-react';

const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Portfolio',
    href: '/portfolio',
    icon: Wallet,
  },
  {
    title: 'Markets',
    href: '/markets',
    icon: TrendingUp,
  },
  {
    title: 'Screener',
    href: '/screener',
    icon: Search,
  },
  {
    title: 'Watchlist',
    href: '/watchlist',
    icon: Star,
  },
  {
    title: 'Macro',
    href: '/macro',
    icon: Globe2,
  },
  {
    title: 'Analysis',
    href: '/analysis',
    icon: BarChart3,
  },
  {
    title: 'News',
    href: '/news',
    icon: Newspaper,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-neutral-800">
        <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
          Principle
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>

        {/* Market Status */}
        <div className="mt-4 px-3 py-2 bg-gray-50 dark:bg-neutral-800 rounded-md">
          <div className="text-xs text-gray-600 dark:text-gray-400">Market Status</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mt-1">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Open
          </div>
        </div>
      </div>
    </aside>
  );
}
