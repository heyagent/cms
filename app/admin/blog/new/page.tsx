'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { blogAPI } from '@/lib/api';
import BlogForm from '@/components/admin/BlogForm';

export default function NewBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      await blogAPI.create(data);
      router.push('/admin/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Create Blog Post
        </h1>
        <p className="mt-1 text-sm md:text-base text-slate-600 dark:text-slate-400">
          Write a new blog post
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <BlogForm
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}