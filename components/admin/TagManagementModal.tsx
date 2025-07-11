'use client';

import { useState } from 'react';
import { tagsAPI } from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, GitMerge, Edit3, Trash2 } from 'lucide-react';
import { TagInput } from '@/components/ui/tag-input';

interface TagManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTag?: { name: string; count: number };
  onSuccess?: () => void;
}

export default function TagManagementModal({
  open,
  onOpenChange,
  selectedTag,
  onSuccess,
}: TagManagementModalProps) {
  const [activeTab, setActiveTab] = useState('rename');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rename state
  const [renameFrom, setRenameFrom] = useState(selectedTag?.name || '');
  const [renameTo, setRenameTo] = useState('');

  // Merge state
  const [mergeTags, setMergeTags] = useState<string[]>(selectedTag ? [selectedTag.name] : []);
  const [mergeInto, setMergeInto] = useState('');

  // Delete state
  const [deleteTag, setDeleteTag] = useState(selectedTag?.name || '');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Reset form when modal opens/closes
  const resetForm = () => {
    setError(null);
    setRenameFrom(selectedTag?.name || '');
    setRenameTo('');
    setMergeTags(selectedTag ? [selectedTag.name] : []);
    setMergeInto('');
    setDeleteTag(selectedTag?.name || '');
    setDeleteConfirm('');
  };

  const handleRename = async () => {
    if (!renameFrom || !renameTo) {
      setError('Both fields are required');
      return;
    }

    if (renameFrom === renameTo) {
      setError('New name must be different from the old name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await tagsAPI.rename(renameFrom, renameTo);
      toast.success(result.message);
      onSuccess?.();
      onOpenChange(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename tag');
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async () => {
    if (mergeTags.length === 0 || !mergeInto) {
      setError('Select tags to merge and specify the target tag');
      return;
    }

    if (mergeTags.includes(mergeInto)) {
      setError('Cannot merge a tag into itself');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await tagsAPI.merge(mergeTags, mergeInto);
      toast.success(result.message);
      onSuccess?.();
      onOpenChange(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge tags');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTag) {
      setError('Select a tag to delete');
      return;
    }

    if (deleteConfirm !== deleteTag) {
      setError(`Type "${deleteTag}" to confirm deletion`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Generate slug for deletion
      const slug = deleteTag.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const result = await tagsAPI.delete(slug);
      toast.success(result.message);
      onSuccess?.();
      onOpenChange(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag');
    } finally {
      setLoading(false);
    }
  };

  const getTagSuggestions = async (query: string): Promise<string[]> => {
    try {
      return await tagsAPI.getSuggestions(query, 10);
    } catch (error) {
      console.error('Failed to fetch tag suggestions:', error);
      return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      onOpenChange(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tag Management</DialogTitle>
          <DialogDescription>
            Manage tags across all blog posts. These operations cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rename" className="gap-2">
              <Edit3 className="h-4 w-4" />
              Rename
            </TabsTrigger>
            <TabsTrigger value="merge" className="gap-2">
              <GitMerge className="h-4 w-4" />
              Merge
            </TabsTrigger>
            <TabsTrigger value="delete" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="rename" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rename-from">Current Tag Name</Label>
              <Input
                id="rename-from"
                value={renameFrom}
                onChange={(e) => setRenameFrom(e.target.value)}
                placeholder="Enter current tag name"
                disabled={loading}
                className="focus:border-amber-400 focus:ring-amber-400/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rename-to">New Tag Name</Label>
              <Input
                id="rename-to"
                value={renameTo}
                onChange={(e) => setRenameTo(e.target.value)}
                placeholder="Enter new tag name"
                disabled={loading}
                className="focus:border-amber-400 focus:ring-amber-400/20"
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handleRename}
                disabled={loading || !renameFrom || !renameTo}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Rename Tag
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="merge" className="space-y-4">
            <div className="space-y-2">
              <Label>Tags to Merge</Label>
              <TagInput
                value={mergeTags}
                onChange={setMergeTags}
                placeholder="Select tags to merge..."
                getSuggestions={getTagSuggestions}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Select multiple tags that will be merged
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="merge-into">Merge Into</Label>
              <Input
                id="merge-into"
                value={mergeInto}
                onChange={(e) => setMergeInto(e.target.value)}
                placeholder="Enter target tag name"
                disabled={loading}
                className="focus:border-amber-400 focus:ring-amber-400/20"
              />
              <p className="text-sm text-muted-foreground">
                All selected tags will be replaced with this tag
              </p>
            </div>
            <DialogFooter>
              <Button
                onClick={handleMerge}
                disabled={loading || mergeTags.length === 0 || !mergeInto}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Merge Tags
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="delete" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will permanently remove the tag from all blog posts. This action cannot be undone.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="delete-tag">Tag to Delete</Label>
              <Input
                id="delete-tag"
                value={deleteTag}
                onChange={(e) => setDeleteTag(e.target.value)}
                placeholder="Enter tag name to delete"
                disabled={loading}
                className="focus:border-amber-400 focus:ring-amber-400/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">Type tag name to confirm</Label>
              <Input
                id="delete-confirm"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="Type tag name to confirm deletion"
                disabled={loading}
                className="focus:border-amber-400 focus:ring-amber-400/20"
              />
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading || !deleteTag || deleteConfirm !== deleteTag}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Tag
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}