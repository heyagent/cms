'use client';

import { useEffect, useState } from 'react';
import { tagsAPI } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Hash, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagCloudProps {
  onTagClick?: (tag: string) => void;
  selectedTags?: string[];
  maxTags?: number;
  className?: string;
}

interface TagWithCount {
  name: string;
  count: number;
}

export default function TagCloud({
  onTagClick,
  selectedTags = [],
  maxTags = 20,
  className,
}: TagCloudProps) {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await tagsAPI.getList();
        
        // Sort by count and take top N tags
        const sortedTags = response.data
          .sort((a, b) => b.count - a.count)
          .slice(0, maxTags);
        
        setTags(sortedTags);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tags');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [maxTags]);

  // Calculate relative sizes based on count
  const maxCount = Math.max(...tags.map(t => t.count), 1);
  const minCount = Math.min(...tags.map(t => t.count), 1);
  const range = maxCount - minCount || 1;

  const getTagSize = (count: number): string => {
    const normalized = (count - minCount) / range;
    
    if (normalized > 0.8) return 'text-base font-semibold';
    if (normalized > 0.6) return 'text-sm font-medium';
    if (normalized > 0.4) return 'text-sm';
    if (normalized > 0.2) return 'text-xs';
    return 'text-xs opacity-80';
  };

  const getTagColor = (count: number): string => {
    const normalized = (count - minCount) / range;
    
    if (normalized > 0.8) return 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 dark:text-amber-400';
    if (normalized > 0.6) return 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 dark:text-yellow-400';
    if (normalized > 0.4) return 'bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400';
    if (normalized > 0.2) return 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300';
    return 'bg-gray-50 hover:bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:hover:bg-gray-800 dark:text-gray-400';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Popular Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || tags.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Popular Tags
        </CardTitle>
        <CardDescription>
          Click to quickly add tags to your post
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag.name);
            return (
              <Button
                key={tag.name}
                variant="ghost"
                size="sm"
                onClick={() => onTagClick?.(tag.name)}
                className={cn(
                  'h-auto px-3 py-1.5 transition-all',
                  getTagSize(tag.count),
                  isSelected 
                    ? 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-semibold' 
                    : getTagColor(tag.count)
                )}
              >
                <Hash className="mr-1 h-3 w-3 opacity-50" />
                {tag.name}
                <span className="ml-1 opacity-60">({tag.count})</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}