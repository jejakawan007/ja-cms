'use client';

import { useState, useCallback, useEffect } from 'react';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: 'admin@jacms.com',
    password: 'admin123'
  });
  const [isValid, setIsValid] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const { login } = useAuth();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Validate form on mount and when formData changes
  useEffect(() => {
    const isValidForm = formData.email.trim() !== '' && formData.password.trim() !== '';
    setIsValid(isValidForm);
  }, [formData.email, formData.password]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');

    try {
      console.log('🔄 Attempting login with:', { email: formData.email, passwordLength: formData.password.length });
      
      await login(formData.email, formData.password);
      
      console.log('✅ Login successful, redirecting to dashboard...');
      
      // Wait for state to be fully updated
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Use window.location for more reliable navigation
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      // Handle different types of errors
      let errorMessage = 'Login failed';
      
      if (error instanceof Error) {
        if (error.message.includes('HTML_RESPONSE')) {
          errorMessage = 'Server returned an error page. Please check if the backend is running.';
        } else if (error.message.includes('NETWORK_ERROR')) {
          errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection.';
        } else if (error.message.includes('TIMEOUT')) {
          errorMessage = 'Request timeout: The server took too long to respond. Please try again.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error: Please try again later or contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, login, formData.email, formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log('Input change:', name, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Don't render until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-300">
              Enter your credentials to access your account
            </CardDescription>
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
              Test credentials: admin@ja-cms.com / admin123
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-300">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !isValid}>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="text-gray-900 dark:text-white hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Demo Credentials
          </h3>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
            <p><strong>Admin:</strong> admin@jacms.com / admin123</p>
            <p><strong>Editor:</strong> editor@jacms.com / editor123</p>
          </div>
        </div>

        {/* Debug info */}
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
            Debug Info
          </h3>
          <div className="space-y-1 text-xs text-yellow-800 dark:text-yellow-200">
            <p><strong>Hydrated:</strong> {isHydrated ? 'Yes' : 'No'}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Password Length:</strong> {formData.password.length}</p>
            <p><strong>Valid:</strong> {isValid ? 'Yes' : 'No'}</p>
            <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
