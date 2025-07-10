'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import clsx from 'clsx';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Listen for sidebar collapse events
    const handleSidebarCollapse = (event: CustomEvent) => {
      setIsCollapsed(event.detail);
    };

    window.addEventListener('sidebar-collapsed', handleSidebarCollapse as EventListener);

    return () => {
      window.removeEventListener('sidebar-collapsed', handleSidebarCollapse as EventListener);
    };
  }, []);

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Header onMenuClick={handleMenuClick} isCollapsed={isCollapsed} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
      
      {/* Main content */}
      <div className={clsx(
        "transition-all duration-300 pt-14 md:pt-0",
        isCollapsed ? "md:ml-20" : "md:ml-56 lg:ml-64"
      )}>
        <main className="min-h-screen p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}