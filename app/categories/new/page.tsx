'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { categoriesAPI } from '@/lib/api';
import CategoryForm from '@/components/admin/CategoryForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      await categoriesAPI.create(data);
      router.push('/categories');
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
        <h1 className="text-2xl md:text-3xl font-bold">
          Create Category
        </h1>
        <p className="mt-1 text-sm md:text-base text-muted-foreground">
          Add a new blog post category
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <CategoryForm
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}