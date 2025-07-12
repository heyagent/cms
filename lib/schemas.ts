import { z } from "zod";

// Author schema
export const authorSchema = z.object({
  slug: z.string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  name: z.string().min(1, "Name is required").max(100),
  bio: z.string().max(500).optional(),
  avatar: z.string().url("Invalid URL").optional().or(z.literal('')),
});

export type Author = z.infer<typeof authorSchema>;

// Category schema
export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  slug: z.string()
    .min(1, "Slug is required")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().max(200).optional(),
});

export type Category = z.infer<typeof categorySchema>;

// Changelog schema
export const changelogSchema = z.object({
  version: z.string()
    .min(1, "Version is required")
    .regex(/^[\d,]+\.[\d,]+\.[\d,]+$/, "Version must be in format 1.0.0 (numbers and commas allowed)"),
  date: z.string().min(1, "Date is required"),
  title: z.string().min(1, "Title is required").max(200),
  summary: z.string().min(1, "Summary is required").max(500),
  improvements: z.array(z.string().min(1)).min(1, "At least one improvement is required"),
  fixes: z.array(z.string().min(1)).default([]),
});

export type Changelog = z.infer<typeof changelogSchema>;

// Blog schema
export const blogSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  authorId: z.number().min(1, "Author is required"),
  categoryId: z.number().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  summary: z.string().min(1, "Summary is required").max(500),
  content: z.string().min(1, "Content is required"),
  readTime: z.string().default("5 min read"),
  tags: z.array(z.string()).default([]),
});

export type Blog = z.infer<typeof blogSchema>;

// Tag schema (for future use)
export const tagSchema = z.object({
  name: z.string().min(1, "Name is required").max(30),
  slug: z.string()
    .min(1, "Slug is required")
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
});

export type Tag = z.infer<typeof tagSchema>;