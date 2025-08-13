// API Client Configuration
// Client configuration for backend connection

// Import debug utilities for development
import './debug';

// Get the API base URL
const getApiBaseUrl = (): string => {
  // Always use Next.js rewrite for API calls
  return '/api';
};

// Debug: Log the API base URL in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API_BASE_URL:', getApiBaseUrl());
  console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔧 NEXT_PUBLIC_API_URL:', process.env['NEXT_PUBLIC_API_URL']);
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError extends Error {
  code?: string;
  status?: number;
  details?: unknown;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Debug: Log the request URL in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🌐 API Request URL:', url);
      console.log('🌐 API Base URL:', this.baseURL);
      console.log('🌐 Request Method:', options.method || 'GET');
    }
    
    // Determine if this is a FormData request
    const isFormData = options.body instanceof FormData;
    
    const config: RequestInit = {
      headers: {
        // Only set Content-Type for non-FormData requests
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      ...options,
    };

    // Add timeout for requests (compatible implementation)
    let timeoutId: NodeJS.Timeout | undefined;
    if (
      typeof AbortSignal !== 'undefined' &&
      typeof (AbortSignal as any).timeout === 'function'
    ) {
      // Use AbortSignal.timeout if available (newer browsers)
      config.signal = (AbortSignal as any).timeout(10000); // 10 second timeout
    } else {
      // Fallback for older browsers
      const controller = new AbortController();
      config.signal = controller.signal;
      timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000); // 10 second timeout
    }

    // Add auth token if available
    let token: string | null = null;
    try {
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('ja-cms-token');
        // Debug: Log token status in development
        if (process.env.NODE_ENV === 'development') {
          console.log('🔑 Token found:', !!token);
          if (token) {
            console.log('🔑 Token length:', token.length);
          }
        }
      }
    } catch (error) {
      // Ignore localStorage errors (e.g., in SSR)
      if (process.env.NODE_ENV === 'development') {
        console.warn('🔑 Token retrieval failed:', error);
      }
    }

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      // Clear timeout if request succeeds
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      let data: any;
      const contentType = response.headers.get('content-type') || '';
      
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // Handle non-JSON responses
          let text: string = '';
          try {
            text = await response.text();
          } catch (_) {
            text = '';
          }
          
          // Try to parse as JSON if it looks like JSON
          if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            try {
              data = JSON.parse(text);
            } catch {
              // If it's not valid JSON, create a structured response
              data = {
                success: false,
                error: {
                  code: 'INVALID_RESPONSE',
                  message: 'Server returned non-JSON response',
                  details: String(text).slice(0, 200) // First 200 chars
                }
              };
            }
          } else {
            // Handle HTML responses (like error pages)
            data = {
              success: false,
              error: {
                code: 'HTML_RESPONSE',
                message: 'Server returned HTML instead of JSON',
                details: String(text).slice(0, 200) // First 200 chars
              }
            };
          }
        }
      } catch (parseError) {
        // Handle JSON parse errors more gracefully
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Response parse error:', {
            status: response.status,
            contentType: contentType || 'unknown',
            parseError: parseError instanceof Error ? parseError.message : String(parseError)
          });
        }
        
        // Create a structured error response
        data = {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Failed to parse server response',
            details: parseError instanceof Error ? parseError.message : String(parseError)
          }
        };
      }

      if (!response.ok) {
        const apiError: ApiError = new Error(
          data && typeof data === 'object' && 'message' in data 
            ? data.message 
            : `HTTP error! status: ${response.status}`
        );
        apiError.code = data && typeof data === 'object' && 'error' in data && data.error && typeof data.error === 'object' && 'code' in data.error 
          ? data.error.code 
          : undefined;
        apiError.status = response.status;
        apiError.details = data && typeof data === 'object' && 'error' in data && data.error && typeof data.error === 'object' && 'details' in data.error 
          ? data.error.details 
          : undefined;
        throw apiError;
      }

      return data;
    } catch (error) {
      // Clear timeout if request fails
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Ensure error is not null/undefined
      const safeError = error || new Error('Unknown error occurred');
      
      // Enhanced error logging for debugging (less verbose)
      if (process.env.NODE_ENV === 'development') {
        const errorInfo = {
          error: safeError instanceof Error ? safeError.message : String(safeError),
          url,
          method: config.method || 'GET',
          hasToken: !!token,
          status: safeError instanceof Error && 'status' in safeError ? (safeError as any).status : 'unknown',
          errorCode: safeError instanceof Error && 'code' in safeError ? (safeError as any).code : 'unknown'
        };
        
        // Only log critical errors or network issues
        if (safeError instanceof TypeError || 
            (safeError instanceof Error && safeError.message.includes('fetch')) ||
            (safeError instanceof Error && safeError.message.includes('Network'))) {
          console.error('❌ Network error:', errorInfo);
        } else if (safeError instanceof Error && 'status' in safeError && (safeError as any).status >= 500) {
          console.error('❌ Server error:', errorInfo);
        } else {
          // Log other errors as warnings instead of errors
          console.warn('⚠️ API request issue:', errorInfo);
        }
      }
      
      // Handle specific connection errors
      if (safeError instanceof TypeError && safeError.message.includes('fetch')) {
        const networkError: ApiError = new Error('Network error: Unable to connect to the server. Please check your internet connection.');
        networkError.code = 'NETWORK_ERROR';
        throw networkError;
      }
      
      if (safeError instanceof Error && safeError.message.includes('ECONNRESET')) {
        const connectionError: ApiError = new Error('Connection reset: The server connection was interrupted. Please try again.');
        connectionError.code = 'CONNECTION_RESET';
        throw connectionError;
      }
      
      // Re-throw the original error if it's already an ApiError
      if (safeError instanceof Error && 'code' in safeError && 'status' in safeError) {
        throw safeError;
      }
      
      // Create a generic API error
      const apiError: ApiError = new Error(safeError instanceof Error ? safeError.message : 'Request failed');
      apiError.code = 'REQUEST_FAILED';
      throw apiError;
    }
  }

  // GET request
  async get<T = unknown>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }
    
    return this.request<T>(url, { method: 'GET' });
  }

  // POST request
  async post<T = unknown>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T = unknown>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T = unknown>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Upload file
  async upload<T = unknown>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(getApiBaseUrl());
