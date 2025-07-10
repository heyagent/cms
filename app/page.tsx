export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          HeyAgent CMS
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Admin interface for managing HeyAgent content
        </p>
        <a
          href="/admin"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-400 to-fuchsia-600 text-white font-semibold rounded-lg hover:from-amber-500 hover:to-fuchsia-700 transition-all"
        >
          Go to Admin Dashboard
        </a>
      </div>
    </div>
  );
}