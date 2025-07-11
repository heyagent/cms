'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authorsAPI, type BlogAuthor } from '@/lib/api';
import { Plus, Loader2, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, createSortableHeader, createSelectColumn } from '@/components/ui/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

export default function AuthorListPage() {
  const router = useRouter();
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authorsAPI.getList();
      setAuthors(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch authors');
      toast.error('Failed to load authors');
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
      toast.success('Author deleted successfully');
      await fetchAuthors(); // Refresh the list
    } catch (err) {
      if (err instanceof Error && err.message.includes('existing posts')) {
        toast.error('Cannot delete this author because they have existing blog posts. Please reassign or delete their posts first.');
      } else {
        const message = err instanceof Error ? err.message : 'Failed to delete author';
        setError(message);
        toast.error(message);
      }
    }
  };

  const columns: ColumnDef<BlogAuthor>[] = [
    createSelectColumn<BlogAuthor>(),
    {
      accessorKey: "name",
      header: createSortableHeader("Author"),
      cell: ({ row }) => {
        const author = row.original;
        return (
          <Link 
            href={`/authors/${author.id}/edit`}
            className="flex items-center space-x-3 hover:opacity-70 transition-opacity"
          >
            <Avatar>
              <AvatarImage src={author.avatar || undefined} alt={author.name} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-primary hover:underline">{author.name}</span>
          </Link>
        );
      },
    },
    {
      accessorKey: "slug",
      header: createSortableHeader("Slug"),
    },
    {
      accessorKey: "bio",
      header: "Bio",
      cell: ({ row }) => {
        const bio = row.getValue("bio") as string;
        return bio ? (
          <span className="text-sm text-muted-foreground truncate max-w-md block">
            {bio}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground italic">No bio</span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => {
        const author = row.original;

        return (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-destructive"
            onClick={() => handleDelete(author.id!)}
            title="Delete author"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Authors
          </h1>
          <p className="mt-1 text-sm md:text-base text-muted-foreground">
            Manage blog post authors
          </p>
        </div>
        
        <Button asChild>
          <Link href="/authors/new">
            <Plus className="mr-2 h-4 w-4" />
            New Author
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={authors}
        searchKey="name"
        pageSize={10}
        onBulkDelete={async (selectedAuthors) => {
          if (!confirm(`Are you sure you want to delete ${selectedAuthors.length} authors? This action cannot be undone.`)) {
            return;
          }
          
          try {
            // For now, delete one by one until we have bulk API
            let successCount = 0;
            let errorCount = 0;
            const errors: string[] = [];
            
            for (const author of selectedAuthors) {
              if (author.id) {
                try {
                  await authorsAPI.delete(author.id);
                  successCount++;
                } catch (err) {
                  errorCount++;
                  if (err instanceof Error && err.message.includes('existing posts')) {
                    errors.push(`${author.name} has existing posts`);
                  }
                }
              }
            }
            
            if (successCount > 0) {
              toast.success(`Successfully deleted ${successCount} author(s)`);
            }
            if (errorCount > 0) {
              if (errors.length > 0) {
                toast.error(`Failed to delete ${errorCount} author(s): ${errors.join(', ')}`);
              } else {
                toast.error(`Failed to delete ${errorCount} author(s)`);
              }
            }
            
            await fetchAuthors(); // Refresh the list
          } catch (err) {
            toast.error('Failed to delete authors');
          }
        }}
      />
    </div>
  );
}