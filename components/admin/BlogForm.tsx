'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { blogSchema, type Blog } from '@/lib/schemas';
import type { BlogPost, BlogAuthor, BlogCategory } from '@/lib/api';
import { authorsAPI, categoriesAPI } from '@/lib/api';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { TagInput } from "@/components/ui/tag-input";
import { tagsAPI } from "@/lib/api";
import RichTextEditor from './RichTextEditor';
import TagCloud from './TagCloud';

interface BlogFormProps {
  initialData?: BlogPost;
  onSubmit: (data: Omit<BlogPost, 'id' | 'author' | 'category'>) => Promise<void>;
  loading?: boolean;
}

export default function BlogForm({ initialData, onSubmit, loading = false }: BlogFormProps) {
  const router = useRouter();
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitError, setSubmitError] = useState<string>('');

  const form = useForm<Blog>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      slug: initialData?.slug || '',
      title: initialData?.title || '',
      summary: initialData?.summary || '',
      content: initialData?.content || '',
      authorId: initialData?.authorId || initialData?.author?.id || 0,
      categoryId: initialData?.categoryId || initialData?.category?.id || 0,
      date: initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
      readTime: initialData?.readTime || '5 min read',
      tags: initialData?.tags || [],
    },
  });

  // Function to get tag suggestions
  const getTagSuggestions = async (query: string): Promise<string[]> => {
    try {
      return await tagsAPI.getSuggestions(query, 10);
    } catch (error) {
      console.error('Failed to fetch tag suggestions:', error);
      return [];
    }
  };

  // Load authors and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [authorsRes, categoriesRes] = await Promise.all([
          authorsAPI.getList(),
          categoriesAPI.getList(),
        ]);
        
        setAuthors(authorsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Failed to load authors/categories:', error);
        setSubmitError('Failed to load authors and categories');
      } finally {
        setLoadingData(false);
      }
    };
    
    loadData();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    const subscription = form.watch((value, { name: fieldName }) => {
      if (fieldName === 'title' && !initialData) {
        const titleValue = value.title || '';
        if (titleValue && !form.getValues('slug')) {
          const generatedSlug = titleValue
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          form.setValue('slug', generatedSlug);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, initialData]);

  // Calculate read time from content
  useEffect(() => {
    const subscription = form.watch((value, { name: fieldName }) => {
      if (fieldName === 'content') {
        const contentValue = value.content || '';
        if (contentValue) {
          // Strip HTML tags to get plain text for word count
          const plainText = contentValue.replace(/<[^>]*>/g, '').trim();
          const words = plainText.split(/\s+/).filter(word => word.length > 0).length;
          const minutes = Math.max(1, Math.ceil(words / 200)); // Average reading speed
          form.setValue('readTime', `${minutes} min read`);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (data: Blog) => {
    try {
      setSubmitError('');
      // Filter out empty tags
      const cleanedData = {
        ...data,
        tags: data.tags.filter(tag => tag.trim()),
      };
      await onSubmit(cleanedData);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save blog post');
    }
  };

  const handleCancel = () => {
    if (form.formState.isDirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    router.push('/blog');
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter blog post title" {...field} />
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
                <Input placeholder="post-url-slug" {...field} />
              </FormControl>
              <FormDescription>
                URL-friendly version of the title (auto-generated if empty)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="authorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an author" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={author.id.toString()}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="readTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Read Time</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
                <FormDescription>
                  Automatically calculated from content
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description of the blog post"
                  className="resize-none"
                  rows={3}
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="Write your blog post content here..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Type to search or add tags..."
                      getSuggestions={getTagSuggestions}
                      maxTags={10}
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    Add relevant tags to help categorize your blog post
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="lg:col-span-1">
            <TagCloud
              selectedTags={form.watch('tags')}
              onTagClick={(tag) => {
                const currentTags = form.getValues('tags');
                if (!currentTags.includes(tag) && currentTags.length < 10) {
                  form.setValue('tags', [...currentTags, tag]);
                }
              }}
              maxTags={15}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button 
            type="submit" 
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Saving...' : (initialData ? 'Update Post' : 'Create Post')}
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