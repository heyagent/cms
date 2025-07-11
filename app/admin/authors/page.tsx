'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authorsAPI, type BlogAuthor } from '@/lib/api';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiUser3Line } from 'react-icons/ri';
import clsx from 'clsx';

export default function AuthorListPage() {
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authorsAPI.getList();
      let authorsList = response.data;
      
      // Apply client-side search filtering
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        authorsList = authorsList.filter(author => 
          author.name.toLowerCase().includes(searchLower) ||
          author.slug.toLowerCase().includes(searchLower) ||
          (author.bio && author.bio.toLowerCase().includes(searchLower))
        );
      }
      
      setAuthors(authorsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch authors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this author? This action cannot be undone.')) {
      return;
    }

    try {
      await authorsAPI.delete(id);
      await fetchAuthors(); // Refresh the list
    } catch (err) {
      if (err instanceof Error && err.message.includes('existing posts')) {
        alert('Cannot delete this author because they have existing blog posts. Please reassign or delete their posts first.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to delete author');
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAuthors();
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchAuthors();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Authors
          </h1>
          <p className="mt-1 text-sm md:text-base text-slate-600 dark:text-slate-400">
            Manage blog post authors
          </p>
        </div>
        
        <Link
          href="/admin/authors/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          <RiAddLine className="w-5 h-5" />
          <span>New Author</span>
        </Link>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search authors..."
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
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Authors Grid/Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Loading...</p>
          </div>
        ) : authors.length === 0 ? (
          <div className="p-8 text-center">
            <RiUser3Line className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm ? 'No authors found matching your search.' : 'No authors yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider max-w-md">
                    Bio
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {authors.map((author) => (
                  <tr key={author.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {author.avatar ? (
                          <img
                            src={author.avatar}
                            alt={author.name}
                            className="w-10 h-10 rounded-full mr-3 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const fallback = document.getElementById(`fallback-${author.id}`);
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          id={`fallback-${author.id}`}
                          className={clsx(
                            "w-10 h-10 rounded-full mr-3 bg-gradient-to-br from-amber-400 to-fuchsia-600 flex items-center justify-center",
                            author.avatar ? "hidden" : "flex"
                          )}
                        >
                          <RiUser3Line className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {author.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {author.slug}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="max-w-md truncate">
                        {author.bio || <span className="italic text-slate-400">No bio</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/authors/${author.id}/edit`}
                          className="p-1.5 text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors"
                          title="Edit"
                        >
                          <RiEditLine className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(author.id!)}
                          className="p-1.5 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}