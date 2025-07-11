'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authorsAPI } from '@/lib/api';
import AuthorForm from '@/components/admin/AuthorForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function NewAuthorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      await authorsAPI.create(data);
      router.push('/admin/authors');
    } catch (err) {
      if (err instanceof Error && err.message.includes('already exists')) {
        setError('An author with this slug already exists. Please choose a different slug.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create author');
      }
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          Create Author
        </h1>
        <p className="mt-1 text-sm md:text-base text-muted-foreground">
          Add a new blog post author
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AuthorForm
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}