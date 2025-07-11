'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { tagsAPI } from '@/lib/api';
import { Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, createSortableHeader } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

interface Tag {
  name: string;
  count: number;
}

export default function TagsListPage() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tagsAPI.getList();
      const tagsList = response.data;
      
      // Sort by count (most used first)
      tagsList.sort((a, b) => b.count - a.count);
      
      setTags(tagsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags');
      toast.error('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const totalPosts = tags.reduce((sum, tag) => sum + tag.count, 0);
  const maxCount = Math.max(...(tags.map(t => t.count) || [1]));

  const columns: ColumnDef<Tag>[] = [
    {
      accessorKey: "name",
      header: createSortableHeader("Tag Name"),
      cell: ({ row }) => {
        const tag = row.original;
        return (
          <Link
            href={`/admin/blog?tag=${encodeURIComponent(tag.name)}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Hash className="w-4 h-4" />
            {tag.name}
          </Link>
        );
      },
    },
    {
      accessorKey: "count",
      header: createSortableHeader("Post Count"),
      cell: ({ row }) => {
        const count = row.getValue("count") as number;
        return (
          <div className="text-right">
            <Badge variant="secondary">
              {count} post{count !== 1 ? 's' : ''}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "usage",
      header: "Usage",
      cell: ({ row }) => {
        const tag = row.original;
        const percentage = totalPosts > 0 ? (tag.count / totalPosts) * 100 : 0;
        const relativeWidth = maxCount > 0 ? (tag.count / maxCount) * 100 : 0;
        
        return (
          <div className="flex items-center justify-end gap-2">
            <div className="flex-1 max-w-[100px]">
              <Progress value={relativeWidth} className="h-2" />
            </div>
            <span className="text-xs text-muted-foreground w-12 text-right">
              {percentage.toFixed(1)}%
            </span>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          Tags
        </h1>
        <p className="mt-1 text-sm md:text-base text-muted-foreground">
          All tags used in blog posts
        </p>
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
        data={tags}
        searchKey="name"
        pageSize={20}
      />

      {/* Summary Stats */}
      {tags.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Total posts with tags: {totalPosts}
        </div>
      )}
    </div>
  );
}