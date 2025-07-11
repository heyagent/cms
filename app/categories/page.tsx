'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { categoriesAPI, type BlogCategory } from '@/lib/api';
import { Plus, Loader2, Folder, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, createSortableHeader, createSelectColumn } from '@/components/ui/data-table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

export default function CategoryListPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await categoriesAPI.getList();
      setCategories(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await categoriesAPI.delete(id);
      toast.success('Category deleted successfully');
      await fetchCategories(); // Refresh the list
    } catch (err) {
      if (err instanceof Error && err.message.includes('existing posts')) {
        toast.error('Cannot delete this category because it has existing blog posts. Please reassign or delete the posts first.');
      } else {
        const message = err instanceof Error ? err.message : 'Failed to delete category';
        setError(message);
        toast.error(message);
      }
    }
  };

  const columns: ColumnDef<BlogCategory>[] = [
    createSelectColumn<BlogCategory>(),
    {
      accessorKey: "name",
      header: createSortableHeader("Name"),
      cell: ({ row }) => {
        const category = row.original;
        return (
          <Link 
            href={`/categories/${category.id}/edit`}
            className="flex items-center space-x-3 hover:opacity-70 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Folder className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium text-primary hover:underline">{category.name}</span>
          </Link>
        );
      },
    },
    {
      accessorKey: "slug",
      header: createSortableHeader("Slug"),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return description ? (
          <span className="text-sm text-muted-foreground truncate max-w-xs block">
            {description}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground italic">No description</span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => {
        const category = row.original;

        return (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-destructive"
            onClick={() => handleDelete(category.id!)}
            title="Delete category"
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
            Categories
          </h1>
          <p className="mt-1 text-sm md:text-base text-muted-foreground">
            Manage blog post categories
          </p>
        </div>
        
        <Button asChild>
          <Link href="/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            New Category
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
        data={categories}
        searchKey="name"
        pageSize={10}
        onBulkDelete={async (selectedCategories) => {
          if (!confirm(`Are you sure you want to delete ${selectedCategories.length} categories? This action cannot be undone.`)) {
            return;
          }
          
          try {
            // For now, delete one by one until we have bulk API
            let successCount = 0;
            let errorCount = 0;
            const errors: string[] = [];
            
            for (const category of selectedCategories) {
              if (category.id) {
                try {
                  await categoriesAPI.delete(category.id);
                  successCount++;
                } catch (err) {
                  errorCount++;
                  if (err instanceof Error && err.message.includes('existing posts')) {
                    errors.push(`${category.name} has existing posts`);
                  }
                }
              }
            }
            
            if (successCount > 0) {
              toast.success(`Successfully deleted ${successCount} category(ies)`);
            }
            if (errorCount > 0) {
              if (errors.length > 0) {
                toast.error(`Failed to delete ${errorCount} category(ies): ${errors.join(', ')}`);
              } else {
                toast.error(`Failed to delete ${errorCount} category(ies)`);
              }
            }
            
            await fetchCategories(); // Refresh the list
          } catch (err) {
            toast.error('Failed to delete categories');
          }
        }}
      />
    </div>
  );
}