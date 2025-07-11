'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { blogAPI } from '@/lib/api';
import BlogForm from '@/components/admin/BlogForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function NewBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      await blogAPI.create(data);
      router.push('/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          Create Blog Post
        </h1>
        <p className="mt-1 text-sm md:text-base text-muted-foreground">
          Write a new blog post
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <BlogForm
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}