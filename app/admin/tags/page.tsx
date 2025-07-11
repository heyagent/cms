'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { tagsAPI } from '@/lib/api';
import { RiHashtag } from 'react-icons/ri';
import clsx from 'clsx';

interface Tag {
  name: string;
  count: number;
}

export default function TagsListPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cloud' | 'list'>('cloud');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tagsAPI.getList();
      const tagsList = response.data;
      
      // Sort by count (most used first)
      tagsList.sort((a, b) => b.count - a.count);
      
      setTags(tagsList);
      setFilteredTags(tagsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const filtered = tags.filter(tag => 
        tag.name.toLowerCase().includes(searchLower)
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags(tags);
    }
  }, [searchTerm, tags]);

  const getTagSize = (count: number, maxCount: number) => {
    // Calculate relative size based on usage
    const minSize = 0.8;
    const maxSize = 2.5;
    const ratio = maxCount > 1 ? count / maxCount : 1;
    // Use logarithmic scale for better distribution
    const logRatio = Math.log(count + 1) / Math.log(maxCount + 1);
    return minSize + (maxSize - minSize) * logRatio;
  };

  const getTagColorClass = (index: number) => {
    const colors = [
      'text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300',
      'text-fuchsia-600 hover:text-fuchsia-700 dark:text-fuchsia-400 dark:hover:text-fuchsia-300',
      'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
      'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300',
      'text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300',
      'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300',
      'text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300',
      'text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300',
    ];
    return colors[index % colors.length];
  };

  const maxCount = Math.max(...(filteredTags.map(t => t.count) || [1]));

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Tags
        </h1>
        <p className="mt-1 text-sm md:text-base text-slate-600 dark:text-slate-400">
          All tags used in blog posts
        </p>
      </div>

      {/* Controls Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tags..."
              className="w-full px-4 py-2 pl-10 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('cloud')}
            className={clsx(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              viewMode === 'cloud'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            Cloud View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            List View
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Loading...</p>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="p-8 text-center">
            <RiHashtag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm ? 'No tags found matching your search.' : 'No tags yet.'}
            </p>
          </div>
        ) : viewMode === 'cloud' ? (
          /* Tag Cloud View */
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap gap-3 justify-center items-center">
              {filteredTags.map((tag, index) => (
                <Link
                  key={tag.name}
                  href={`/admin/blog?tag=${encodeURIComponent(tag.name)}`}
                  className={clsx(
                    'inline-block transition-all hover:scale-110',
                    getTagColorClass(index)
                  )}
                  style={{ fontSize: `${getTagSize(tag.count, maxCount)}rem` }}
                  title={`${tag.count} post${tag.count !== 1 ? 's' : ''}`}
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
            <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
              {filteredTags.length} tag{filteredTags.length !== 1 ? 's' : ''} • 
              Click a tag to filter blog posts
            </p>
          </div>
        ) : (
          /* List View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tag Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Post Count
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredTags.map((tag, index) => (
                  <tr key={tag.name} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/blog?tag=${encodeURIComponent(tag.name)}`}
                        className={clsx(
                          'inline-flex items-center gap-1.5 text-sm font-medium transition-colors',
                          getTagColorClass(index)
                        )}
                      >
                        <RiHashtag className="w-4 h-4" />
                        {tag.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-600 dark:text-slate-400">
                      {tag.count} post{tag.count !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex-1 max-w-[100px]">
                          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-amber-400 to-fuchsia-600 h-2 rounded-full transition-all"
                              style={{ width: `${(tag.count / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {((tag.count / tags.reduce((sum, t) => sum + t.count, 0)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {!loading && filteredTags.length > 0 && (
        <div className="mt-4 text-sm text-slate-600 dark:text-slate-400 text-center">
          Total posts with tags: {filteredTags.reduce((sum, tag) => sum + tag.count, 0)}
        </div>
      )}
    </div>
  );
}