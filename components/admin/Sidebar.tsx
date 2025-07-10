'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import { 
  RiDashboardLine,
  RiArticleLine,
  RiHistoryLine,
  RiAddLine,
  RiFolderLine,
  RiPriceTag3Line,
  RiGitBranchLine,
  RiMenuLine,
  RiCloseLine,
  RiCircleFill
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
          'fixed top-0 left-0 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 z-50 transition-transform duration-300',
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

        {/* Menu */}
        <div className="p-4 overflow-y-auto h-[calc(100%-80px)] sidebar-scroll">
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