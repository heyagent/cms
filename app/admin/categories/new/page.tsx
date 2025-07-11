'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { categoriesAPI } from '@/lib/api';
import CategoryForm from '@/components/admin/CategoryForm';

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      await categoriesAPI.create(data);
      router.push('/admin/categories');
    } catch (err) {
      if (err instanceof Error && err.message.includes('already exists')) {
        setError('A category with this slug already exists. Please choose a different slug.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create category');
      }
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Create Category
        </h1>
        <p className="mt-1 text-sm md:text-base text-slate-600 dark:text-slate-400">
          Add a new blog post category
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <CategoryForm
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}