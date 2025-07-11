const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

// Types
export interface ChangelogEntry {
  id?: number;
  version: string;
  date: string;
  title: string;
  summary: string;
  improvements: string[];
  fixes: string[];
  status?: 'draft' | 'published';
}

export interface BlogAuthor {
  id?: number;
  slug: string;
  name: string;
  bio?: string;
  avatar?: string;
}

export interface BlogCategory {
  id?: number;
  slug: string;
  name: string;
  description?: string;
}

export interface BlogPost {
  id?: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  author?: BlogAuthor;
  authorId?: number;
  category?: BlogCategory;
  categoryId?: number;
  date: string;
  readTime: string;
  tags: string[];
}

export interface BlogStats {
  totalPosts: number;
  totalAuthors: number;
  totalCategories: number;
  totalTags: number;
  recentPosts: Array<{
    id: number;
    slug: string;
    title: string;
    date: string;
  }>;
  popularTags: Array<{
    tag: string;
    count: number;
  }>;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationData;
  message?: string;
  error?: string;
}

// Helper function for API calls
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Changelog API functions
export const changelogAPI = {
  // Get paginated list
  async getList(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<ChangelogEntry[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.search) queryParams.set('search', params.search);

    return fetchAPI<ApiResponse<ChangelogEntry[]>>(
      `/api/v1/changelog${queryParams.toString() ? `?${queryParams}` : ''}`
    );
  },

  // Get single entry
  async getById(id: number): Promise<ApiResponse<ChangelogEntry>> {
    return fetchAPI<ApiResponse<ChangelogEntry>>(`/api/v1/changelog/${id}`);
  },

  // Create new entry
  async create(data: ChangelogEntry): Promise<ApiResponse<ChangelogEntry>> {
    return fetchAPI<ApiResponse<ChangelogEntry>>('/api/v1/changelog', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update entry
  async update(
    id: number,
    data: ChangelogEntry
  ): Promise<ApiResponse<ChangelogEntry>> {
    return fetchAPI<ApiResponse<ChangelogEntry>>(`/api/v1/changelog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete entry
  async delete(id: number): Promise<{ message: string }> {
    return fetchAPI<{ message: string }>(`/api/v1/changelog/${id}`, {
      method: 'DELETE',
    });
  },

  // Bulk delete entries
  async bulkDelete(ids: number[]): Promise<{ message: string; deletedCount: number; deletedIds: number[] }> {
    return fetchAPI<{ message: string; deletedCount: number; deletedIds: number[] }>('/api/v1/changelog/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
  },

  // Update status
  async updateStatus(
    id: number,
    status: 'draft' | 'published'
  ): Promise<ApiResponse<{ id: number; status: string }>> {
    return fetchAPI<ApiResponse<{ id: number; status: string }>>(
      `/api/v1/changelog/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  },

  // Get statistics
  async getStats(): Promise<
    ApiResponse<{ total: number; published: number; draft: number }>
  > {
    return fetchAPI<
      ApiResponse<{ total: number; published: number; draft: number }>
    >('/api/v1/changelog/stats');
  },
};

// Blog API functions
export const blogAPI = {
  // Get paginated list
  async getList(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    author?: string;
    categories?: string[];
    tags?: string[];
  }): Promise<ApiResponse<BlogPost[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.search) queryParams.set('search', params.search);
    if (params?.category) queryParams.set('category', params.category);
    if (params?.author) queryParams.set('author', params.author);
    
    // Handle array parameters
    params?.categories?.forEach(cat => queryParams.append('categories', cat));
    params?.tags?.forEach(tag => queryParams.append('tags', tag));

    return fetchAPI<ApiResponse<BlogPost[]>>(
      `/api/v1/blog${queryParams.toString() ? `?${queryParams}` : ''}`
    );
  },

  // Get single post by ID
  async getById(id: number): Promise<ApiResponse<BlogPost>> {
    return fetchAPI<ApiResponse<BlogPost>>(`/api/v1/blog/id/${id}`);
  },

  // Get single post by slug
  async getBySlug(slug: string): Promise<ApiResponse<BlogPost>> {
    return fetchAPI<ApiResponse<BlogPost>>(`/api/v1/blog/${slug}`);
  },

  // Create new post
  async create(data: Omit<BlogPost, 'id' | 'author' | 'category'>): Promise<ApiResponse<BlogPost>> {
    return fetchAPI<ApiResponse<BlogPost>>('/api/v1/blog', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update post
  async update(
    id: number,
    data: Omit<BlogPost, 'id' | 'author' | 'category'>
  ): Promise<ApiResponse<BlogPost>> {
    return fetchAPI<ApiResponse<BlogPost>>(`/api/v1/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete post
  async delete(id: number): Promise<{ message: string }> {
    return fetchAPI<{ message: string }>(`/api/v1/blog/${id}`, {
      method: 'DELETE',
    });
  },

  // Bulk delete posts
  async bulkDelete(ids: number[]): Promise<{ message: string; deletedCount: number; deletedIds: number[] }> {
    return fetchAPI<{ message: string; deletedCount: number; deletedIds: number[] }>('/api/v1/blog/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
  },

  // Get statistics
  async getStats(): Promise<ApiResponse<BlogStats>> {
    return fetchAPI<ApiResponse<BlogStats>>('/api/v1/blog/stats');
  },
};

// Authors API functions
export const authorsAPI = {
  // Get all authors
  async getList(): Promise<ApiResponse<BlogAuthor[]>> {
    return fetchAPI<ApiResponse<BlogAuthor[]>>('/api/v1/blog/authors');
  },

  // Create new author
  async create(data: Omit<BlogAuthor, 'id'>): Promise<ApiResponse<BlogAuthor>> {
    return fetchAPI<ApiResponse<BlogAuthor>>('/api/v1/blog/authors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update author
  async update(id: number, data: Omit<BlogAuthor, 'id'>): Promise<ApiResponse<BlogAuthor>> {
    return fetchAPI<ApiResponse<BlogAuthor>>(`/api/v1/blog/authors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete author
  async delete(id: number): Promise<{ message: string }> {
    return fetchAPI<{ message: string }>(`/api/v1/blog/authors/${id}`, {
      method: 'DELETE',
    });
  },
};

// Categories API functions
export const categoriesAPI = {
  // Get all categories
  async getList(): Promise<ApiResponse<BlogCategory[]>> {
    return fetchAPI<ApiResponse<BlogCategory[]>>('/api/v1/blog/categories');
  },

  // Create new category
  async create(data: Omit<BlogCategory, 'id'>): Promise<ApiResponse<BlogCategory>> {
    return fetchAPI<ApiResponse<BlogCategory>>('/api/v1/blog/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update category
  async update(id: number, data: Omit<BlogCategory, 'id'>): Promise<ApiResponse<BlogCategory>> {
    return fetchAPI<ApiResponse<BlogCategory>>(`/api/v1/blog/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete category
  async delete(id: number): Promise<{ message: string }> {
    return fetchAPI<{ message: string }>(`/api/v1/blog/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Tags API functions
export const tagsAPI = {
  // Get all unique tags with counts
  async getList(): Promise<ApiResponse<Array<{ name: string; count: number }>>> {
    return fetchAPI<ApiResponse<Array<{ name: string; count: number }>>>('/api/v1/blog/tags');
  },

  // Get tag suggestions based on query
  async getSuggestions(query: string, limit?: number): Promise<string[]> {
    const params = new URLSearchParams({ q: query });
    if (limit) params.set('limit', limit.toString());
    
    const response = await fetchAPI<ApiResponse<string[]>>(
      `/api/v1/blog/tags/suggestions?${params.toString()}`
    );
    return response.data;
  },

  // Rename a tag across all posts
  async rename(from: string, to: string): Promise<{ message: string; affected: number }> {
    return fetchAPI<{ message: string; affected: number }>('/api/v1/blog/tags/rename', {
      method: 'POST',
      body: JSON.stringify({ from, to }),
    });
  },

  // Merge multiple tags into one
  async merge(tags: string[], into: string): Promise<{ message: string; affected: number }> {
    return fetchAPI<{ message: string; affected: number }>('/api/v1/blog/tags/merge', {
      method: 'POST',
      body: JSON.stringify({ tags, into }),
    });
  },

  // Delete a tag from all posts
  async delete(slug: string): Promise<{ message: string; affected: number }> {
    return fetchAPI<{ message: string; affected: number }>(`/api/v1/blog/tags/${slug}`, {
      method: 'DELETE',
    });
  },
};