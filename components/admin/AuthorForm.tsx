'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authorSchema, type Author } from '@/lib/schemas';
import type { BlogAuthor } from '@/lib/api';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthorFormProps {
  initialData?: BlogAuthor;
  onSubmit: (data: Omit<BlogAuthor, 'id'>) => Promise<void>;
  loading?: boolean;
}

export default function AuthorForm({ initialData, onSubmit, loading = false }: AuthorFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string>('');

  const form = useForm<Author>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      slug: initialData?.slug || '',
      name: initialData?.name || '',
      bio: initialData?.bio || '',
      avatar: initialData?.avatar || '',
    },
  });

  // Auto-generate slug from name
  useEffect(() => {
    const subscription = form.watch((value, { name: fieldName }) => {
      if (fieldName === 'name' && !initialData) {
        const nameValue = value.name || '';
        if (nameValue && !form.getValues('slug')) {
          const generatedSlug = nameValue
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          form.setValue('slug', generatedSlug);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, initialData]);

  const handleSubmit = async (data: Author) => {
    try {
      setSubmitError('');
      await onSubmit(data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save author');
    }
  };

  const handleCancel = () => {
    if (form.formState.isDirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    router.push('/admin/authors');
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter author name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input 
                  placeholder="author-url-slug" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                URL-friendly version of the name (auto-generated if empty)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description about the author"
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0} / 500 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL</FormLabel>
              <FormControl>
                <Input 
                  type="url" 
                  placeholder="https://example.com/avatar.jpg" 
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional: URL to author's profile picture
              </FormDescription>
              <FormMessage />
              
              {/* Avatar Preview */}
              {field.value && (
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-sm font-medium">Preview:</span>
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={field.value} alt={form.getValues('name')} />
                    <AvatarFallback>
                      {form.getValues('name') ? getInitials(form.getValues('name')) : 'AU'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button 
            type="submit" 
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Saving...' : (initialData ? 'Update Author' : 'Create Author')}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}