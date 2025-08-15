/**
 * URL Utility Functions
 * Helper functions for URL manipulation and validation
 */

/**
 * Check if string is a valid URL
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function isValidUrlString(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get domain from URL
 * @param url - URL to extract domain from
 * @returns Domain name
 */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * Get path from URL
 * @param url - URL to extract path from
 * @returns Path string
 */
export function getPath(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    return '';
  }
}

/**
 * Get query parameters from URL
 * @param url - URL to extract query parameters from
 * @returns Object with query parameters
 */
export function getQueryParams(url: string): Record<string, string> {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};
    
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  } catch {
    return {};
  }
}

/**
 * Add query parameters to URL
 * @param url - Base URL
 * @param params - Parameters to add
 * @returns URL with added parameters
 */
export function addQueryParams(
  url: string,
  params: Record<string, string | number | boolean>
): string {
  try {
    const urlObj = new URL(url);
    
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.set(key, String(value));
    });
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Remove query parameters from URL
 * @param url - URL to remove parameters from
 * @param params - Array of parameter names to remove
 * @returns URL without specified parameters
 */
export function removeQueryParams(url: string, params: string[]): string {
  try {
    const urlObj = new URL(url);
    
    params.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Update query parameter in URL
 * @param url - Base URL
 * @param key - Parameter key
 * @param value - Parameter value
 * @returns URL with updated parameter
 */
export function updateQueryParam(url: string, key: string, value: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set(key, value);
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Get query parameter value from URL
 * @param url - URL to get parameter from
 * @param key - Parameter key
 * @returns Parameter value or null
 */
export function getQueryParam(url: string, key: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get(key);
  } catch {
    return null;
  }
}

/**
 * Build URL from parts
 * @param parts - URL parts
 * @returns Constructed URL
 */
export function buildUrl(parts: {
  protocol?: string;
  hostname: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
}): string {
  const { protocol = 'https', hostname, port, pathname = '', search = '', hash = '' } = parts;
  
  let url = `${protocol}://${hostname}`;
  
  if (port) {
    url += `:${port}`;
  }
  
  if (pathname) {
    url += pathname.startsWith('/') ? pathname : `/${pathname}`;
  }
  
  if (search) {
    url += search.startsWith('?') ? search : `?${search}`;
  }
  
  if (hash) {
    url += hash.startsWith('#') ? hash : `#${hash}`;
  }
  
  return url;
}

/**
 * Normalize URL (remove trailing slash, ensure protocol)
 * @param url - URL to normalize
 * @returns Normalized URL
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Ensure protocol
    if (!urlObj.protocol) {
      urlObj.protocol = 'https:';
    }
    
    // Remove trailing slash from pathname (except root)
    if (urlObj.pathname.length > 1 && urlObj.pathname.endsWith('/')) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Get relative URL from absolute URL
 * @param absoluteUrl - Absolute URL
 * @param baseUrl - Base URL
 * @returns Relative URL
 */
export function getRelativeUrl(absoluteUrl: string, baseUrl: string): string {
  try {
    const absolute = new URL(absoluteUrl);
    const base = new URL(baseUrl);
    
    if (absolute.origin !== base.origin) {
      return absoluteUrl;
    }
    
    return absolute.pathname + absolute.search + absolute.hash;
  } catch {
    return absoluteUrl;
  }
}

/**
 * Check if URL is external
 * @param url - URL to check
 * @param baseUrl - Base URL for comparison
 * @returns True if external URL
 */
export function isExternalUrl(url: string, baseUrl?: string): boolean {
  try {
    const urlObj = new URL(url);
    
    if (!baseUrl) {
      // If no base URL provided, check if it's a relative URL
      return url.startsWith('http://') || url.startsWith('https://');
    }
    
    const baseObj = new URL(baseUrl);
    return urlObj.origin !== baseObj.origin;
  } catch {
    return false;
  }
}

/**
 * Get file extension from URL
 * @param url - URL to get extension from
 * @returns File extension or empty string
 */
export function getFileExtension(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const lastDotIndex = pathname.lastIndexOf('.');
    
    if (lastDotIndex === -1) {
      return '';
    }
    
    return pathname.substring(lastDotIndex + 1).toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Check if URL is an image
 * @param url - URL to check
 * @returns True if image URL
 */
export function isImageUrl(url: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const extension = getFileExtension(url);
  return imageExtensions.includes(extension);
}

/**
 * Check if URL is a video
 * @param url - URL to check
 * @returns True if video URL
 */
export function isVideoUrl(url: string): boolean {
  const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv'];
  const extension = getFileExtension(url);
  return videoExtensions.includes(extension);
}

/**
 * Check if URL is a document
 * @param url - URL to check
 * @returns True if document URL
 */
export function isDocumentUrl(url: string): boolean {
  const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
  const extension = getFileExtension(url);
  return documentExtensions.includes(extension);
}

/**
 * Encode URL parameters
 * @param params - Parameters to encode
 * @returns Encoded query string
 */
export function encodeUrlParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}

/**
 * Decode URL parameters
 * @param queryString - Query string to decode
 * @returns Decoded parameters object
 */
export function decodeUrlParams(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);
  
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}
