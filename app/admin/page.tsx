'use client';

import { useState, useEffect } from 'react';
import { changelogAPI } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    changelog: 0,
    blog: 0,
    categories: 0,
    tags: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const changelogStats = await changelogAPI.getStats();
      setStats(prev => ({
        ...prev,
        changelog: changelogStats.data.total,
      }));
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 md:mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400">
          Welcome to HeyAgent CMS. Manage your content from here.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Blog Posts Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-1.5 md:p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? '...' : stats.blog}
          </h3>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-0.5 md:mt-1">Total Blog Posts</p>
        </div>

        {/* Changelog Entries Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-1.5 md:p-2 bg-fuchsia-50 dark:bg-fuchsia-900/20 rounded-lg">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-fuchsia-600 dark:text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? '...' : stats.changelog}
          </h3>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-0.5 md:mt-1">Changelog Entries</p>
        </div>

        {/* Categories Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-1.5 md:p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? '...' : stats.categories}
          </h3>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-0.5 md:mt-1">Categories</p>
        </div>

        {/* Tags Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-1.5 md:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? '...' : stats.tags}
          </h3>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-0.5 md:mt-1">Tags</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="text-center py-8 md:py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gray-100 dark:bg-slate-800 rounded-full mb-3 md:mb-4">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 px-4">
            No recent activity. Start by creating your first blog post or changelog entry.
          </p>
        </div>
      </div>
    </div>
  );
}