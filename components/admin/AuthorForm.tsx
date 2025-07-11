'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import type { BlogAuthor } from '@/lib/api';

interface AuthorFormProps {
  initialData?: BlogAuthor;
  onSubmit: (data: Omit<BlogAuthor, 'id'>) => Promise<void>;
  loading?: boolean;
}

export default function AuthorForm({ initialData, onSubmit, loading = false }: AuthorFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<BlogAuthor, 'id'>>({
    slug: '',
    name: '',
    bio: '',
    avatar: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        slug: initialData.slug,
        name: initialData.name,
        bio: initialData.bio || '',
        avatar: initialData.avatar || '',
      });
    }
  }, [initialData]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!initialData && formData.name && !formData.slug) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, formData.slug, initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug = 'Slug must be lowercase with hyphens only';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.avatar && !isValidUrl(formData.avatar)) {
      newErrors.avatar = 'Avatar must be a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleCancel = () => {
    if (isDirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    router.push('/admin/authors');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter author name"
          className={clsx(
            'w-full px-3 py-2 rounded-lg border',
            'bg-white dark:bg-slate-900',
            'focus:outline-none focus:ring-2 focus:ring-amber-500',
            errors.name
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-slate-700'
          )}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
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
          placeholder="author-url-slug"
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
          URL-friendly version of the name (auto-generated if empty)
        </p>
      </div>

      {/* Bio Field */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={4}
          placeholder="Brief description about the author"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {formData.bio?.length || 0} characters
        </p>
      </div>

      {/* Avatar Field */}
      <div>
        <label htmlFor="avatar" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Avatar URL
        </label>
        <input
          type="text"
          id="avatar"
          name="avatar"
          value={formData.avatar}
          onChange={handleInputChange}
          placeholder="https://example.com/avatar.jpg"
          className={clsx(
            'w-full px-3 py-2 rounded-lg border',
            'bg-white dark:bg-slate-900',
            'focus:outline-none focus:ring-2 focus:ring-amber-500',
            errors.avatar
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-slate-700'
          )}
        />
        {errors.avatar && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.avatar}</p>
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Optional: URL to author&apos;s profile picture
        </p>
        
        {/* Avatar Preview */}
        {formData.avatar && isValidUrl(formData.avatar) && (
          <div className="mt-3">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Preview:</p>
            <img
              src={formData.avatar}
              alt="Avatar preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-slate-700"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
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
            initialData ? 'Update Author' : 'Create Author'
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