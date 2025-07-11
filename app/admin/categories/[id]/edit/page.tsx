'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { categoriesAPI, type BlogCategory } from '@/lib/api';
import CategoryForm from '@/components/admin/CategoryForm';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  
  const [data, setData] = useState<BlogCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isNaN(id)) {
      fetchCategory();
    } else {
      setError('Invalid category ID');
      setLoading(false);
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await categoriesAPI.getList();
      const category = response.data.find(c => c.id === id);
      
      if (category) {
        setData(category);
      } else {
        setError('Category not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch category');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      setSubmitting(true);
      setError(null);
      
      await categoriesAPI.update(id, formData);
      router.push('/admin/categories');
    } catch (err) {
      if (err instanceof Error && err.message.includes('already exists')) {
        setError('A category with this slug already exists. Please choose a different slug.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update category');
      }
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Error Loading Category</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/categories')}
            className="px-4 py-2 bg-gray-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Edit Category
        </h1>
        <p className="mt-1 text-sm md:text-base text-slate-600 dark:text-slate-400">
          Update category information for {data?.name}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <CategoryForm
        initialData={data}
        onSubmit={handleSubmit}
        loading={submitting}
      />
    </div>
  );
}