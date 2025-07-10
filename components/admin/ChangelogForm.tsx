'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RiAddLine, RiDeleteBinLine } from 'react-icons/ri';
import clsx from 'clsx';
import type { ChangelogEntry } from '@/lib/api';

interface ChangelogFormProps {
  initialData?: ChangelogEntry;
  onSubmit: (data: ChangelogEntry) => Promise<void>;
  loading?: boolean;
}

export default function ChangelogForm({ initialData, onSubmit, loading = false }: ChangelogFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ChangelogEntry>({
    version: '',
    date: new Date().toISOString().split('T')[0],
    title: '',
    summary: '',
    improvements: [],
    fixes: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: initialData.date.split('T')[0], // Ensure date is in YYYY-MM-DD format
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Version validation
    if (!formData.version) {
      newErrors.version = 'Version is required';
    } else if (!/^v\d+\.\d+\.\d+$/.test(formData.version)) {
      newErrors.version = 'Version must be in format v1.0.0';
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Summary validation
    if (!formData.summary.trim()) {
      newErrors.summary = 'Summary is required';
    }

    // Improvements validation
    const hasEmptyImprovement = formData.improvements.some(imp => !imp.trim());
    if (hasEmptyImprovement) {
      newErrors.improvements = 'All improvements must have content';
    }

    // Fixes validation
    const hasEmptyFix = formData.fixes.some(fix => !fix.trim());
    if (hasEmptyFix) {
      newErrors.fixes = 'All fixes must have content';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };


  const handleArrayItemChange = (
    type: 'improvements' | 'fixes',
    index: number,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => (i === index ? value : item)),
    }));
    setIsDirty(true);

    // Clear error for this field
    if (errors[type]) {
      setErrors(prev => ({ ...prev, [type]: '' }));
    }
  };

  const handleAddArrayItem = (type: 'improvements' | 'fixes') => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], ''],
    }));
    setIsDirty(true);
  };

  const handleRemoveArrayItem = (type: 'improvements' | 'fixes', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Filter out empty array items
    const dataToSubmit = {
      ...formData,
      improvements: formData.improvements.filter(imp => imp.trim()),
      fixes: formData.fixes.filter(fix => fix.trim()),
    };

    await onSubmit(dataToSubmit);
  };

  const handleCancel = () => {
    if (isDirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    router.push('/admin/changelog');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Version and Date Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Version Field */}
        <div>
          <label htmlFor="version" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Version
          </label>
          <input
            type="text"
            id="version"
            name="version"
            value={formData.version}
            onChange={handleInputChange}
            placeholder="v1.0.0"
            className={clsx(
              'w-full px-3 py-2 rounded-lg border',
              'bg-white dark:bg-slate-900',
              'focus:outline-none focus:ring-2 focus:ring-amber-500',
              errors.version
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-slate-700'
            )}
          />
          {errors.version && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.version}</p>
          )}
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Format: v1.0.0 (major.minor.patch)
          </p>
        </div>

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
      </div>

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
          placeholder="Enter changelog title"
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
          rows={4}
          placeholder="Describe the changes in this release"
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

      {/* Improvements Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Improvements
          </label>
          <button
            type="button"
            onClick={() => handleAddArrayItem('improvements')}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
          >
            <RiAddLine className="w-4 h-4" />
            Add Improvement
          </button>
        </div>
        
        {errors.improvements && (
          <p className="mb-2 text-sm text-red-600 dark:text-red-400">{errors.improvements}</p>
        )}

        <div className="space-y-2">
          {formData.improvements.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              No improvements added yet
            </p>
          ) : (
            formData.improvements.map((improvement, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={improvement}
                  onChange={(e) => handleArrayItemChange('improvements', index, e.target.value)}
                  placeholder={`Improvement ${index + 1}`}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('improvements', index)}
                  className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  title="Remove improvement"
                >
                  <RiDeleteBinLine className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Fixes Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Fixes
          </label>
          <button
            type="button"
            onClick={() => handleAddArrayItem('fixes')}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
          >
            <RiAddLine className="w-4 h-4" />
            Add Fix
          </button>
        </div>
        
        {errors.fixes && (
          <p className="mb-2 text-sm text-red-600 dark:text-red-400">{errors.fixes}</p>
        )}

        <div className="space-y-2">
          {formData.fixes.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              No fixes added yet
            </p>
          ) : (
            formData.fixes.map((fix, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={fix}
                  onChange={(e) => handleArrayItemChange('fixes', index, e.target.value)}
                  placeholder={`Fix ${index + 1}`}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('fixes', index)}
                  className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  title="Remove fix"
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
            initialData ? 'Update Entry' : 'Create Entry'
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