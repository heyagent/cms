'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { changelogAPI } from '@/lib/api';
import ChangelogForm from '@/components/admin/ChangelogForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function NewChangelogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      await changelogAPI.create(data);
      router.push('/changelog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          Create Changelog Entry
        </h1>
        <p className="mt-1 text-sm md:text-base text-muted-foreground">
          Add a new entry to the changelog
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ChangelogForm
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}