import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar />
      
      {/* Main content */}
      <div className="lg:ml-64">
        <main className="min-h-screen p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}