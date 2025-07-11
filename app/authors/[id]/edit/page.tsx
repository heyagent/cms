'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authorsAPI, type BlogAuthor } from '@/lib/api';
import AuthorForm from '@/components/admin/AuthorForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditAuthorPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  
  const [data, setData] = useState<BlogAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isNaN(id)) {
      fetchAuthor();
    } else {
      setError('Invalid author ID');
      setLoading(false);
    }
  }, [id]);

  const fetchAuthor = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authorsAPI.getList();
      const author = response.data.find(a => a.id === id);
      
      if (author) {
        setData(author);
      } else {
        setError('Author not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch author');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      setSubmitting(true);
      setError(null);
      
      await authorsAPI.update(id, formData);
      router.push('/authors');
    } catch (err) {
      if (err instanceof Error && err.message.includes('already exists')) {
        setError('An author with this slug already exists. Please choose a different slug.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update author');
      }
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Author</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button
            variant="secondary"
            onClick={() => router.push('/authors')}
          >
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          Edit Author
        </h1>
        <p className="mt-1 text-sm md:text-base text-muted-foreground">
          Update author information for {data?.name}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AuthorForm
        initialData={data}
        onSubmit={handleSubmit}
        loading={submitting}
      />
    </div>
  );
}