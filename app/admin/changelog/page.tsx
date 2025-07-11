'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { changelogAPI, type ChangelogEntry } from '@/lib/api';
import { Plus, Calendar, Loader2 } from 'lucide-react';
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

export default function ChangelogListPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await changelogAPI.getList({
        limit: 100, // Get all entries for now
      });
      
      setEntries(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entries');
      toast.error('Failed to load changelog entries');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this changelog entry?')) {
      return;
    }

    try {
      await changelogAPI.delete(id);
      toast.success('Changelog entry deleted successfully');
      await fetchEntries(); // Refresh the list
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete entry';
      setError(message);
      toast.error(message);
    }
  };

  const columns: ColumnDef<ChangelogEntry>[] = [
    {
      accessorKey: "version",
      header: createSortableHeader("Version"),
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.getValue("version")}
        </Badge>
      ),
    },
    {
      accessorKey: "title",
      header: createSortableHeader("Title"),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "date",
      header: createSortableHeader("Date"),
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {date.toLocaleDateString()}
          </div>
        );
      },
    },
    {
      accessorKey: "summary",
      header: "Summary",
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
          {row.getValue("summary")}
        </p>
      ),
    },
    {
      id: "stats",
      header: "Changes",
      cell: ({ row }) => {
        const improvements = row.original.improvements?.length || 0;
        const fixes = row.original.fixes?.length || 0;
        return (
          <div className="flex gap-2">
            {improvements > 0 && (
              <Badge variant="default" className="text-xs">
                {improvements} improvements
              </Badge>
            )}
            {fixes > 0 && (
              <Badge variant="secondary" className="text-xs">
                {fixes} fixes
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const entry = row.original;

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
                onClick={() => router.push(`/admin/changelog/${entry.id}/edit`)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(entry.id!)}
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
            Changelog
          </h1>
          <p className="mt-1 text-sm md:text-base text-muted-foreground">
            Manage your changelog entries
          </p>
        </div>
        
        <Button asChild>
          <Link href="/admin/changelog/new">
            <Plus className="mr-2 h-4 w-4" />
            New Entry
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
        data={entries}
        searchKey="title"
        pageSize={10}
      />
    </div>
  );
}