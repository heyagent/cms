'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { changelogAPI, blogAPI, type BlogStats } from '@/lib/api';
import { RiArticleLine, RiHashtag } from 'react-icons/ri';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    changelog: 0,
    blog: 0,
    categories: 0,
    tags: 0,
  });
  const [blogStats, setBlogStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch both changelog and blog stats in parallel
      const [changelogStats, blogStatsResponse] = await Promise.all([
        changelogAPI.getStats(),
        blogAPI.getStats(),
      ]);

      setBlogStats(blogStatsResponse.data);
      setStats({
        changelog: changelogStats.data.total,
        blog: blogStatsResponse.data.totalPosts,
        categories: blogStatsResponse.data.totalCategories,
        tags: blogStatsResponse.data.totalTags,
      });
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

      {/* Recent Activity and Popular Tags Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Blog Posts */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
              Recent Blog Posts
            </h2>
            <Link
              href="/admin/blog"
              className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
            >
              View all →
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : blogStats?.recentPosts && blogStats.recentPosts.length > 0 ? (
            <div className="space-y-3">
              {blogStats.recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/blog/${post.id}/edit`}
                  className="block group"
                >
                  <div className="flex items-start gap-3">
                    <RiArticleLine className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(post.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full mb-3">
                <RiArticleLine className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No blog posts yet.
              </p>
            </div>
          )}
        </div>

        {/* Popular Tags */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
              Popular Tags
            </h2>
            <Link
              href="/admin/tags"
              className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
            >
              View all →
            </Link>
          </div>
          
          {loading ? (
            <div className="flex flex-wrap gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-16"></div>
                </div>
              ))}
            </div>
          ) : blogStats?.popularTags && blogStats.popularTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {blogStats.popularTags.slice(0, 10).map((tag, index) => (
                <Link
                  key={tag.tag}
                  href={`/admin/blog?tag=${encodeURIComponent(tag.tag)}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full text-sm hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                >
                  <RiHashtag className="w-3 h-3" />
                  <span>{tag.tag}</span>
                  <span className="text-xs opacity-70">({tag.count})</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full mb-3">
                <RiHashtag className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No tags yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}