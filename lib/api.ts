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

// Blog API functions (placeholder for future implementation)
export const blogAPI = {
  // TODO: Implement blog API functions
};