'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, type Category } from '@/lib/schemas';
import type { BlogCategory } from '@/lib/api';
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
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CategoryFormProps {
  initialData?: BlogCategory;
  onSubmit: (data: Omit<BlogCategory, 'id'>) => Promise<void>;
  loading?: boolean;
}

export default function CategoryForm({ initialData, onSubmit, loading = false }: CategoryFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string>('');

  const form = useForm<Category>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
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

  const handleSubmit = async (data: Category) => {
    try {
      setSubmitError('');
      await onSubmit(data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save category');
    }
  };

  const handleCancel = () => {
    if (form.formState.isDirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    router.push('/categories');
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
                <Input placeholder="Enter category name" {...field} />
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
                  placeholder="category-url-slug" 
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description of the category"
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0} / 200 characters
              </FormDescription>
              <FormMessage />
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
            {loading ? 'Saving...' : (initialData ? 'Update Category' : 'Create Category')}
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