'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { changelogAPI } from '@/lib/api';
import ChangelogForm from '@/components/admin/ChangelogForm';

export default function NewChangelogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      await changelogAPI.create(data);
      router.push('/admin/changelog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Create Changelog Entry
        </h1>
        <p className="mt-1 text-sm md:text-base text-slate-600 dark:text-slate-400">
          Add a new entry to the changelog
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <ChangelogForm
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}