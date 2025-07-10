'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import clsx from 'clsx';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar />
      
      {/* Main content */}
      <div className={clsx(
        "transition-all duration-300",
        isCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        <main className="min-h-screen p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}