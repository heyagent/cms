'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { blogAPI, type BlogPost } from '@/lib/api';
import { Plus, Calendar, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, createSortableHeader } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

export default function BlogListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tagFilter = searchParams.get('tag');
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [tagFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await blogAPI.getList({
        limit: 100, // Get all posts for now
        tags: tagFilter ? [tagFilter] : undefined,
      });
      
      setPosts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      await blogAPI.delete(id);
      toast.success('Blog post deleted successfully');
      await fetchPosts(); // Refresh the list
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete post';
      setError(message);
      toast.error(message);
    }
  };

  const columns: ColumnDef<BlogPost>[] = [
    {
      accessorKey: "title",
      header: createSortableHeader("Title"),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("title")}</span>
          <span className="text-xs text-muted-foreground">/{row.original.slug}</span>
        </div>
      ),
    },
    {
      accessorKey: "author.name",
      header: createSortableHeader("Author"),
      cell: ({ row }) => row.original.author?.name || 'Unknown',
    },
    {
      accessorKey: "category.name",
      header: createSortableHeader("Category"),
      cell: ({ row }) => row.original.category?.name || 'Uncategorized',
    },
    {
      accessorKey: "date",
      header: createSortableHeader("Date"),
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        );
      },
    },
    {
      id: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.original.tags || [];
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const post = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/admin/blog/${post.id}/edit`)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(post.id!)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            Blog Posts
          </h1>
          <p className="mt-1 text-sm md:text-base text-muted-foreground">
            Manage your blog content
          </p>
          {tagFilter && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
              <span>Filtered by tag: <strong>{tagFilter}</strong></span>
              <Link
                href="/admin/blog"
                className="hover:opacity-80"
                title="Clear filter"
              >
                <X className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
        
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
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
        data={posts}
        searchKey="title"
        pageSize={10}
      />
    </div>
  );
}