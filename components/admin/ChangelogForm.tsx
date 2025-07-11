'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changelogSchema, type Changelog } from '@/lib/schemas';
import type { ChangelogEntry } from '@/lib/api';
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
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChangelogFormProps {
  initialData?: ChangelogEntry;
  onSubmit: (data: ChangelogEntry) => Promise<void>;
  loading?: boolean;
}

export default function ChangelogForm({ initialData, onSubmit, loading = false }: ChangelogFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string>('');

  const form = useForm<Changelog>({
    resolver: zodResolver(changelogSchema),
    defaultValues: {
      version: initialData?.version || '',
      date: initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
      title: initialData?.title || '',
      summary: initialData?.summary || '',
      improvements: initialData?.improvements || [''],
      fixes: initialData?.fixes || [],
    },
  });

  const {
    fields: improvementFields,
    append: appendImprovement,
    remove: removeImprovement,
  } = useFieldArray({
    control: form.control,
    name: "improvements",
  });

  const {
    fields: fixFields,
    append: appendFix,
    remove: removeFix,
  } = useFieldArray({
    control: form.control,
    name: "fixes",
  });

  const handleSubmit = async (data: Changelog) => {
    try {
      setSubmitError('');
      // Filter out empty strings from arrays
      const cleanedData: ChangelogEntry = {
        ...data,
        improvements: data.improvements.filter(imp => imp.trim()),
        fixes: data.fixes.filter(fix => fix.trim()),
      };
      await onSubmit(cleanedData);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save changelog entry');
    }
  };

  const handleCancel = () => {
    if (form.formState.isDirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    router.push('/admin/changelog');
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Version</FormLabel>
                <FormControl>
                  <Input placeholder="v1.0.0" {...field} />
                </FormControl>
                <FormDescription>
                  Format: v1.0.0 (major.minor.patch)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter changelog title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the changes in this release"
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

        {/* Improvements Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Improvements</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendImprovement('')}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Improvement
            </Button>
          </div>
          
          {improvementFields.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No improvements added yet
            </p>
          ) : (
            <div className="space-y-2">
              {improvementFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`improvements.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            placeholder={`Improvement ${index + 1}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeImprovement(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {form.formState.errors.improvements && (
            <p className="text-sm text-destructive">
              {form.formState.errors.improvements.message}
            </p>
          )}
        </div>

        {/* Fixes Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Fixes</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendFix('')}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Fix
            </Button>
          </div>
          
          {fixFields.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No fixes added yet
            </p>
          ) : (
            <div className="space-y-2">
              {fixFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`fixes.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            placeholder={`Fix ${index + 1}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFix(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button 
            type="submit" 
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Saving...' : (initialData ? 'Update Entry' : 'Create Entry')}
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