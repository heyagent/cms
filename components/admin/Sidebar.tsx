'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { 
  RiDashboardLine,
  RiArticleLine,
  RiHistoryLine,
  RiMenuLine,
  RiCloseLine,
  RiCircleFill,
  RiUserLine,
  RiNotificationLine,
  RiMoonLine,
  RiSunLine,
  RiSettings3Line,
  RiLogoutBoxLine,
  RiUser3Line
} from 'react-icons/ri';

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  submenu?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  }[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Blog', 'Changelog']);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: <RiDashboardLine className="text-xl" />,
    },
    {
      label: 'Blog',
      icon: <RiArticleLine className="text-xl" />,
      submenu: [
        { label: 'All Posts', href: '/admin/blog', icon: <RiCircleFill className="w-2 h-2 text-amber-400" /> },
        { label: 'Create New', href: '/admin/blog/new', icon: <RiCircleFill className="w-2 h-2 text-amber-400" /> },
        { label: 'Categories', href: '/admin/blog/categories', icon: <RiCircleFill className="w-2 h-2 text-amber-400" /> },
        { label: 'Tags', href: '/admin/blog/tags', icon: <RiCircleFill className="w-2 h-2 text-amber-400" /> },
      ],
    },
    {
      label: 'Changelog',
      icon: <RiHistoryLine className="text-xl" />,
      submenu: [
        { label: 'All Entries', href: '/admin/changelog', icon: <RiCircleFill className="w-2 h-2 text-amber-400" /> },
        { label: 'Create New', href: '/admin/changelog/new', icon: <RiCircleFill className="w-2 h-2 text-amber-400" /> },
        { label: 'Version History', href: '/admin/changelog/versions', icon: <RiCircleFill className="w-2 h-2 text-amber-400" /> },
      ],
    },
  ];

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (submenu?: MenuItem['submenu']) => {
    return submenu?.some(item => pathname.startsWith(item.href));
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 z-50 transition-transform duration-300 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'w-64'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <Link href="/admin" className="flex items-center space-x-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-fuchsia-600 text-transparent bg-clip-text">
              ✳
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              HEYAGENT
            </span>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <RiCloseLine className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Menu - scrollable area */}
        <div className="flex-1 p-4 overflow-y-auto sidebar-scroll">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      isActive(item.href)
                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                    )}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={clsx(
                        'flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors',
                        isParentActive(item.submenu)
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <svg
                        className={clsx(
                          'w-4 h-4 transition-transform',
                          expandedMenus.includes(item.label) ? 'rotate-90' : ''
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {expandedMenus.includes(item.label) && item.submenu && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {item.submenu.map((subitem) => (
                          <li key={subitem.href}>
                            <Link
                              href={subitem.href}
                              className={clsx(
                                'flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-sm',
                                isActive(subitem.href)
                                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                              )}
                            >
                              {subitem.icon}
                              <span>{subitem.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-slate-700 p-4 space-y-3">
          {/* User Menu - Full Width */}
          <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-fuchsia-600 rounded-full flex items-center justify-center">
                  <RiUserLine className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate flex-1">
                  Admin User
                </span>
                <svg
                  className={clsx(
                    'w-4 h-4 text-slate-400 transition-transform ml-auto',
                    showUserMenu ? 'rotate-180' : ''
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showUserMenu && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg">
                  <div className="p-2">
                    <Link
                      href="/admin/profile"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                    >
                      <RiUser3Line className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                    >
                      <RiSettings3Line className="w-4 h-4" />
                      Settings
                    </Link>
                    <div className="my-1 border-t border-gray-200 dark:border-slate-700"></div>
                    <button
                      className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors w-full text-left"
                    >
                      <RiLogoutBoxLine className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
          </div>
          
          {/* Icons Row - Dark Mode & Notifications */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <RiSunLine className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <RiMoonLine className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RiNotificationLine className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute bottom-full mb-2 left-0 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg">
                  <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                      No new notifications
                    </p>
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-slate-700">
                    <button className="w-full text-sm text-amber-600 dark:text-amber-400 hover:bg-gray-50 dark:hover:bg-slate-700 p-2 rounded transition-colors">
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className={clsx(
          'fixed top-4 left-4 p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-md lg:hidden z-40',
          isOpen && 'hidden'
        )}
      >
        <RiMenuLine className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      </button>
    </>
  );
}