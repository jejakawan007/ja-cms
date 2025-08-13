'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft,
  User,
  Mail,
  Lock,
  Save,
  Loader2
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'ADMIN' | 'EDITOR' | 'USER' | 'VIEWER';
  phone: string;
  bio: string;
  location: string;
  website: string;
}

export default function CreateUserPage() {
  const router = useRouter();
  const { createUser, loading } = useUsers();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    phone: '',
    bio: '',
    location: '',
    website: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData['firstName'].trim()) {
      newErrors['firstName'] = 'First name is required';
    }

    if (!formData['lastName'].trim()) {
      newErrors['lastName'] = 'Last name is required';
    }

    if (!formData['email'].trim()) {
      newErrors['email'] = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData['email'])) {
      newErrors['email'] = 'Email is invalid';
    }

    if (!formData['password']) {
      newErrors['password'] = 'Password is required';
    } else if (formData['password'].length < 8) {
      newErrors['password'] = 'Password must be at least 8 characters';
    }

    if (formData['password'] !== formData['confirmPassword']) {
      newErrors['confirmPassword'] = 'Passwords do not match';
    }

    if (formData['website'] && !/^https?:\/\/.+/.test(formData['website'])) {
      newErrors['website'] = 'Website must be a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const { confirmPassword, ...userData } = formData;
      await createUser(userData);
      router.push('/dashboard/users');
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
              <p className="text-muted-foreground">
                Add a new user to the system
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                      className={errors['firstName'] ? 'border-red-500' : ''}
                    />
                                          {errors['firstName'] && (
                        <p className="text-sm text-red-500">{errors['firstName']}</p>
                      )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                      className={errors['lastName'] ? 'border-red-500' : ''}
                    />
                    {errors['lastName'] && (
                      <p className="text-sm text-red-500">{errors['lastName']}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                                          className={errors['email'] ? 'border-red-500' : ''}
                    />
                    {errors['email'] && (
                      <p className="text-sm text-red-500">{errors['email']}</p>
                    )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                      <SelectItem value="EDITOR">Editor</SelectItem>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter password"
                                          className={errors['password'] ? 'border-red-500' : ''}
                    />
                    {errors['password'] && (
                      <p className="text-sm text-red-500">{errors['password']}</p>
                    )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm password"
                                          className={errors['confirmPassword'] ? 'border-red-500' : ''}
                    />
                    {errors['confirmPassword'] && (
                      <p className="text-sm text-red-500">{errors['confirmPassword']}</p>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter location"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://example.com"
                                          className={errors['website'] ? 'border-red-500' : ''}
                    />
                    {errors['website'] && (
                      <p className="text-sm text-red-500">{errors['website']}</p>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about this user..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating User...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
  );
}
