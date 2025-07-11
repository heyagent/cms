'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RiAddLine, RiDeleteBinLine } from 'react-icons/ri';
import clsx from 'clsx';
import type { BlogPost, BlogAuthor, BlogCategory } from '@/lib/api';
import { authorsAPI, categoriesAPI } from '@/lib/api';
import RichTextEditor from './RichTextEditor';

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
  
  const [formData, setFormData] = useState<Omit<BlogPost, 'id' | 'author' | 'category'>>({
    slug: '',
    title: '',
    summary: '',
    content: '',
    authorId: 0,
    categoryId: 0,
    date: new Date().toISOString().split('T')[0],
    readTime: '5 min read',
    tags: [],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

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
      } finally {
        setLoadingData(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        slug: initialData.slug,
        title: initialData.title,
        summary: initialData.summary,
        content: initialData.content,
        authorId: initialData.authorId || initialData.author?.id || 0,
        categoryId: initialData.categoryId || initialData.category?.id || 0,
        date: initialData.date.split('T')[0],
        readTime: initialData.readTime,
        tags: initialData.tags || [],
      });
    }
  }, [initialData]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialData && formData.title && !formData.slug) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, formData.slug, initialData]);

  // Calculate read time from content
  useEffect(() => {
    if (formData.content) {
      // Strip HTML tags to get plain text for word count
      const plainText = formData.content.replace(/<[^>]*>/g, '').trim();
      const words = plainText.split(/\s+/).filter(word => word.length > 0).length;
      const minutes = Math.max(1, Math.ceil(words / 200)); // Average reading speed, minimum 1 minute
      setFormData(prev => ({ ...prev, readTime: `${minutes} min read` }));
    }
  }, [formData.content]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug = 'Slug must be lowercase with hyphens only';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.summary.trim()) {
      newErrors.summary = 'Summary is required';
    }

    // Check if content has actual text (not just empty HTML tags)
    const contentText = formData.content.replace(/<[^>]*>/g, '').trim();
    if (!contentText) {
      newErrors.content = 'Content is required';
    }

    if (!formData.authorId) {
      newErrors.authorId = 'Author is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    // Tags validation
    const hasEmptyTag = formData.tags.some(tag => !tag.trim());
    if (hasEmptyTag) {
      newErrors.tags = 'All tags must have content';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'authorId' || name === 'categoryId' ? parseInt(value) : value 
    }));
    setIsDirty(true);
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => (i === index ? value : tag)),
    }));
    setIsDirty(true);

    if (errors.tags) {
      setErrors(prev => ({ ...prev, tags: '' }));
    }
  };

  const handleAddTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, ''],
    }));
    setIsDirty(true);
  };

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Filter out empty tags
    const dataToSubmit = {
      ...formData,
      tags: formData.tags.filter(tag => tag.trim()),
    };

    await onSubmit(dataToSubmit);
  };

  const handleCancel = () => {
    if (isDirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    router.push('/admin/blog');
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter blog post title"
          className={clsx(
            'w-full px-3 py-2 rounded-lg border',
            'bg-white dark:bg-slate-900',
            'focus:outline-none focus:ring-2 focus:ring-amber-500',
            errors.title
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-slate-700'
          )}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
        )}
      </div>

      {/* Slug Field */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Slug
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleInputChange}
          placeholder="post-url-slug"
          className={clsx(
            'w-full px-3 py-2 rounded-lg border',
            'bg-white dark:bg-slate-900',
            'focus:outline-none focus:ring-2 focus:ring-amber-500',
            errors.slug
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-slate-700'
          )}
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug}</p>
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          URL-friendly version of the title (auto-generated if empty)
        </p>
      </div>

      {/* Author and Category Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Author Field */}
        <div>
          <label htmlFor="authorId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Author
          </label>
          <select
            id="authorId"
            name="authorId"
            value={formData.authorId}
            onChange={handleInputChange}
            className={clsx(
              'w-full px-3 py-2 rounded-lg border',
              'bg-white dark:bg-slate-900',
              'focus:outline-none focus:ring-2 focus:ring-amber-500',
              errors.authorId
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-slate-700'
            )}
          >
            <option value={0}>Select an author</option>
            {authors.map(author => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
          {errors.authorId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.authorId}</p>
          )}
        </div>

        {/* Category Field */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            className={clsx(
              'w-full px-3 py-2 rounded-lg border',
              'bg-white dark:bg-slate-900',
              'focus:outline-none focus:ring-2 focus:ring-amber-500',
              errors.categoryId
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-slate-700'
            )}
          >
            <option value={0}>Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categoryId}</p>
          )}
        </div>
      </div>

      {/* Date and Read Time Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Field */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className={clsx(
              'w-full px-3 py-2 rounded-lg border',
              'bg-white dark:bg-slate-900',
              'focus:outline-none focus:ring-2 focus:ring-amber-500',
              errors.date
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-slate-700'
            )}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
          )}
        </div>

        {/* Read Time Field */}
        <div>
          <label htmlFor="readTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Read Time
          </label>
          <input
            type="text"
            id="readTime"
            name="readTime"
            value={formData.readTime}
            onChange={handleInputChange}
            placeholder="5 min read"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Auto-calculated based on content length
          </p>
        </div>
      </div>

      {/* Summary Field */}
      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Summary
        </label>
        <textarea
          id="summary"
          name="summary"
          value={formData.summary}
          onChange={handleInputChange}
          rows={3}
          placeholder="Brief description of the blog post"
          className={clsx(
            'w-full px-3 py-2 rounded-lg border resize-none',
            'bg-white dark:bg-slate-900',
            'focus:outline-none focus:ring-2 focus:ring-amber-500',
            errors.summary
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-slate-700'
          )}
        />
        {errors.summary && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.summary}</p>
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {formData.summary.length} characters
        </p>
      </div>

      {/* Content Field */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Content
        </label>
        <RichTextEditor
          content={formData.content}
          onChange={(newContent) => {
            setFormData(prev => ({ ...prev, content: newContent }));
            setIsDirty(true);
            if (errors.content) {
              setErrors(prev => ({ ...prev, content: '' }));
            }
          }}
          placeholder="Write your blog post content here..."
          error={!!errors.content}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
        )}
      </div>

      {/* Tags Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tags
          </label>
          <button
            type="button"
            onClick={handleAddTag}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
          >
            <RiAddLine className="w-4 h-4" />
            Add Tag
          </button>
        </div>
        
        {errors.tags && (
          <p className="mb-2 text-sm text-red-600 dark:text-red-400">{errors.tags}</p>
        )}

        <div className="space-y-2">
          {formData.tags.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              No tags added yet
            </p>
          ) : (
            formData.tags.map((tag, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => handleTagChange(index, e.target.value)}
                  placeholder={`Tag ${index + 1}`}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTag(index)}
                  className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  title="Remove tag"
                >
                  <RiDeleteBinLine className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
        <button
          type="submit"
          disabled={loading}
          className={clsx(
            'flex-1 sm:flex-none px-6 py-2 rounded-lg font-medium transition-all',
            'bg-gradient-to-r from-amber-400 to-fuchsia-600',
            'text-white hover:shadow-lg',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-amber-500'
          )}
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Saving...
            </>
          ) : (
            initialData ? 'Update Post' : 'Create Post'
          )}
        </button>
        
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className={clsx(
            'flex-1 sm:flex-none px-6 py-2 rounded-lg font-medium transition-colors',
            'bg-gray-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
            'hover:bg-gray-300 dark:hover:bg-slate-700',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-gray-500'
          )}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}