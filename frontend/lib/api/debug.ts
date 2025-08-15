// API Debug Utilities
// Utilities untuk debugging API issues

import { apiClient } from './client';

// Debug utility untuk testing API connection
export const debugAPI = {
  // Test basic connectivity
  async testConnection() {
    console.log('🔍 Testing API connection...');
    try {
      const result = await apiClient.get('/health');
      console.log('API Connection Test Result:', result);
      return result;
    } catch (error) {
      console.error('API Connection Test Failed:', error);
      return { success: false, error };
    }
  },

  // Test specific endpoint
  async testEndpoint(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any) {
    console.log(`🔍 Testing endpoint: ${method} ${endpoint}`);
    
    try {
      const response = await fetch(`/api${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      console.log('Response Status:', response.status);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
      
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Response Data:', data);
        return { success: true, data, status: response.status };
      } else {
        const text = await response.text();
        console.log('Non-JSON Response:', text.substring(0, 500));
        return { success: false, text, status: response.status };
      }
    } catch (error) {
      console.error('Request failed:', error);
      return { success: false, error: error instanceof Error ? error.message : error };
    }
  },

  // List common endpoints to test
  getCommonEndpoints() {
    return [
      '/dashboard/system-health',
      '/dashboard/overview',
      '/posts',
      '/categories',
      '/tags',
      '/media',
      '/settings',
      '/auth/me'
    ];
  },

  // Test all common endpoints
  async testAllEndpoints() {
    console.log('🔍 Testing all common endpoints...');
    const endpoints = this.getCommonEndpoints();
    const results = [];

    for (const endpoint of endpoints) {
      console.log(`\n--- Testing ${endpoint} ---`);
      const result = await this.testEndpoint(endpoint);
      results.push({ endpoint, ...result });
    }

    console.log('\n📊 All Endpoint Test Results:', results);
    return results;
  },

  // Check for specific error patterns
  analyzeError(error: any) {
    console.log('🔍 Analyzing error:', error);
    
    if (error instanceof Error) {
      console.log('Error Type:', error.constructor.name);
      console.log('Error Message:', error.message);
      console.log('Error Stack:', error.stack);
      
      if ('code' in error) {
        console.log('Error Code:', (error as any).code);
      }
      if ('status' in error) {
        console.log('Error Status:', (error as any).status);
      }
    }
  }
};

// Make debug utility available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugAPI = debugAPI;
  console.log('🔧 API Debug utilities available at window.debugAPI');
  console.log('Available methods:');
  console.log('- debugAPI.testConnection()');
  console.log('- debugAPI.testEndpoint(endpoint)');
  console.log('- debugAPI.testAllEndpoints()');
  console.log('- debugAPI.analyzeError(error)');
}
