'use client';

import Link from 'next/link';
import { RiMenuLine } from 'react-icons/ri';
import clsx from 'clsx';

interface HeaderProps {
  onMenuClick: () => void;
  isCollapsed: boolean;
}

export default function Header({ onMenuClick, isCollapsed }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 md:h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 z-40">
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        {/* Left side - Logo and Menu button */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open menu"
          >
            <RiMenuLine className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>

          {/* Logo - Always visible */}
          <Link href="/admin" className="flex items-center space-x-2">
            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-fuchsia-600 text-transparent bg-clip-text">
              ✳
            </span>
            <span className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              HEYAGENT
            </span>
          </Link>
        </div>

        {/* Right side - Could add user menu, notifications, etc. here later */}
        <div className="flex items-center gap-4">
          {/* Placeholder for future header actions */}
        </div>
      </div>
    </header>
  );
}