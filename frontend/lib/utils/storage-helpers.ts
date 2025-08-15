/**
 * Storage Utility Functions
 * Helper functions for localStorage, sessionStorage, and cookies
 */

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ja-cms-token',
  REFRESH_TOKEN: 'refreshToken',
  USER_PREFERENCES: 'user-preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  DASHBOARD_LAYOUT: 'dashboard-layout',
  SIDEBAR_COLLAPSED: 'sidebar-collapsed',
} as const;

/**
 * Set item in localStorage
 * @param key - Storage key
 * @param value - Value to store
 */
export function setLocalStorage<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined') {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    }
  } catch (error) {
    console.error('Error setting localStorage item:', error);
  }
}

/**
 * Get item from localStorage
 * @param key - Storage key
 * @param defaultValue - Default value if item doesn't exist
 * @returns Stored value or default value
 */
export function getLocalStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue || null;
      }
      
      try {
        return JSON.parse(item);
      } catch {
        return item as T;
      }
    }
  } catch (error) {
    console.error('Error getting localStorage item:', error);
  }
  
  return defaultValue || null;
}

/**
 * Remove item from localStorage
 * @param key - Storage key
 */
export function removeLocalStorage(key: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error removing localStorage item:', error);
  }
}

/**
 * Clear all localStorage
 */
export function clearLocalStorage(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Set item in sessionStorage
 * @param key - Storage key
 * @param value - Value to store
 */
export function setSessionStorage<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined') {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    }
  } catch (error) {
    console.error('Error setting sessionStorage item:', error);
  }
}

/**
 * Get item from sessionStorage
 * @param key - Storage key
 * @param defaultValue - Default value if item doesn't exist
 * @returns Stored value or default value
 */
export function getSessionStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    if (typeof window !== 'undefined') {
      const item = sessionStorage.getItem(key);
      if (item === null) {
        return defaultValue || null;
      }
      
      try {
        return JSON.parse(item);
      } catch {
        return item as T;
      }
    }
  } catch (error) {
    console.error('Error getting sessionStorage item:', error);
  }
  
  return defaultValue || null;
}

/**
 * Remove item from sessionStorage
 * @param key - Storage key
 */
export function removeSessionStorage(key: string): void {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error removing sessionStorage item:', error);
  }
}

/**
 * Clear all sessionStorage
 */
export function clearSessionStorage(): void {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
  }
}

/**
 * Set cookie
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options
 */
export function setCookie(
  name: string,
  value: string,
  options: {
    expires?: Date;
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
): void {
  try {
    if (typeof window !== 'undefined') {
      let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
      
      if (options.expires) {
        cookieString += `; expires=${options.expires.toUTCString()}`;
      }
      
      if (options.maxAge) {
        cookieString += `; max-age=${options.maxAge}`;
      }
      
      if (options.path) {
        cookieString += `; path=${options.path}`;
      }
      
      if (options.domain) {
        cookieString += `; domain=${options.domain}`;
      }
      
      if (options.secure) {
        cookieString += '; secure';
      }
      
      if (options.sameSite) {
        cookieString += `; samesite=${options.sameSite}`;
      }
      
      document.cookie = cookieString;
    }
  } catch (error) {
    console.error('Error setting cookie:', error);
  }
}

/**
 * Get cookie
 * @param name - Cookie name
 * @returns Cookie value or null
 */
export function getCookie(name: string): string | null {
  try {
    if (typeof window !== 'undefined') {
      const nameEQ = `${encodeURIComponent(name)}=`;
      const cookies = document.cookie.split(';');
      
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
          return decodeURIComponent(cookie.substring(nameEQ.length));
        }
      }
    }
  } catch (error) {
    console.error('Error getting cookie:', error);
  }
  
  return null;
}

/**
 * Remove cookie
 * @param name - Cookie name
 * @param options - Cookie options (path and domain)
 */
export function removeCookie(
  name: string,
  options: { path?: string; domain?: string } = {}
): void {
  setCookie(name, '', {
    ...options,
    expires: new Date(0),
    maxAge: -1,
  });
}

/**
 * Check if storage is available
 * @param type - Storage type ('localStorage' or 'sessionStorage')
 * @returns True if storage is available
 */
export function isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const storage = window[type];
    const testKey = '__storage_test__';
    
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage size in bytes
 * @param type - Storage type ('localStorage' or 'sessionStorage')
 * @returns Storage size in bytes
 */
export function getStorageSize(type: 'localStorage' | 'sessionStorage'): number {
  try {
    if (typeof window === 'undefined') {
      return 0;
    }
    
    const storage = window[type];
    let size = 0;
    
    for (let key in storage) {
      if (storage.hasOwnProperty(key)) {
        size += storage[key].length + key.length;
      }
    }
    
    return size;
  } catch {
    return 0;
  }
}

/**
 * Get storage usage percentage
 * @param type - Storage type ('localStorage' or 'sessionStorage')
 * @returns Usage percentage (0-100)
 */
export function getStorageUsage(type: 'localStorage' | 'sessionStorage'): number {
  try {
    if (typeof window === 'undefined') {
      return 0;
    }
    
    const size = getStorageSize(type);
    
    // Approximate storage limit (varies by browser)
    const limit = type === 'localStorage' ? 5 * 1024 * 1024 : 5 * 1024 * 1024; // 5MB
    
    return (size / limit) * 100;
  } catch {
    return 0;
  }
}
