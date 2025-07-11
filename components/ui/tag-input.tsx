'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Tag {
  id: string;
  text: string;
}

interface TagInputProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  minLength?: number;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  getSuggestions?: (query: string) => Promise<string[]>;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "Add a tag...",
  maxTags = Infinity,
  minLength = 2,
  maxLength = 30,
  disabled = false,
  className,
  onTagAdd,
  onTagRemove,
  getSuggestions,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState(-1);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);

  // Convert string array to Tag objects for internal use
  const tags: Tag[] = value.map((text, index) => ({
    id: `${text}-${index}`,
    text,
  }));

  // Validation regex - alphanumeric, spaces, and hyphens only
  const validationPattern = /^[a-zA-Z0-9\s\-]+$/;

  // Fetch suggestions when input changes
  React.useEffect(() => {
    const fetchSuggestions = async () => {
      if (!getSuggestions || inputValue.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const results = await getSuggestions(inputValue);
        // Filter out already selected tags
        const filtered = results.filter(
          (suggestion) => !value.some((tag) => tag.toLowerCase() === suggestion.toLowerCase())
        );
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue, getSuggestions, value]);

  // Handle clicks outside to close suggestions
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateTag = (tag: string): string | null => {
    if (tag.length < minLength) {
      return `Tag must be at least ${minLength} characters`;
    }
    if (tag.length > maxLength) {
      return `Tag must be less than ${maxLength} characters`;
    }
    if (!validationPattern.test(tag)) {
      return 'Tag can only contain letters, numbers, spaces, and hyphens';
    }
    if (tag.includes('  ') || tag.includes('--')) {
      return 'Tag cannot contain consecutive spaces or hyphens';
    }
    return null;
  };

  const addTag = (tagText: string) => {
    const trimmedTag = tagText.trim();
    
    if (!trimmedTag) return;

    // Validate tag
    const validationError = validateTag(trimmedTag);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check for duplicates (case-insensitive)
    if (value.some((tag) => tag.toLowerCase() === trimmedTag.toLowerCase())) {
      setError('Tag already exists');
      return;
    }

    // Check max tags limit
    if (tags.length >= maxTags) {
      setError(`Maximum ${maxTags} tags allowed`);
      return;
    }

    const newTags = [...value, trimmedTag];
    onChange?.(newTags);
    onTagAdd?.(trimmedTag);
    setInputValue('');
    setError(null);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const removeTag = (tagToRemove: Tag) => {
    const newTags = value.filter((tag) => tag !== tagToRemove.text);
    onChange?.(newTags);
    onTagRemove?.(tagToRemove.text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
      e.preventDefault();
      
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        addTag(suggestions[selectedSuggestionIndex]);
      } else {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      const lastTag = tags[tags.length - 1];
      removeTag(lastTag);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Handle comma-separated input
    if (value.includes(',')) {
      const parts = value.split(',');
      const tagToAdd = parts[0].trim();
      if (tagToAdd) {
        addTag(tagToAdd);
      }
      setInputValue(parts.slice(1).join(',').trimStart());
    } else {
      setInputValue(value);
      setError(null);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex flex-wrap gap-2 p-2 border rounded-md bg-background dark:bg-slate-800/50",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-destructive",
          "focus-within:ring-2 focus-within:ring-amber-400/20 focus-within:border-amber-400 transition-all"
        )}
      >
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="gap-1 pr-1 text-sm"
          >
            <span>{tag.text}</span>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </Badge>
        ))}
        <Input
          ref={inputRef}
          type="text"
          placeholder={tags.length === 0 ? placeholder : ""}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          disabled={disabled || tags.length >= maxTags}
          className="flex-1 min-w-[120px] border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-popover dark:bg-slate-800 border dark:border-slate-700 rounded-md shadow-md"
        >
          <ul className="py-1 max-h-48 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                className={cn(
                  "px-3 py-2 cursor-pointer text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400 transition-colors",
                  selectedSuggestionIndex === index && "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                )}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedSuggestionIndex(index)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <p className="mt-1 text-xs text-muted-foreground">
        Press Enter, Tab, or comma to add a tag
      </p>
    </div>
  );
}