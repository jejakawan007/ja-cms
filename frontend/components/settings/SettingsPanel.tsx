'use client'

import { useState } from 'react'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { Badge } from '@/components/ui/badge'
import { Search, /* Filter, */ /* Settings, */ ArrowLeft } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SettingsCard, SETTINGS_CATEGORIES } from './SettingsCard'
import { SettingsForm } from './SettingsForm'
import { useSettings } from '@/hooks/useSettings'
import { cn } from '@/lib/cn'

interface SettingsPanelProps {
  onBack?: () => void
  className?: string
}

export function SettingsPanel({ onBack, className }: SettingsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  
  // Settings API integration
  const {
    settings,
    // categories,
    isLoading,
    // error,
    updateCategorySettings,
    resetSettings,
    // hasChanges,
    isSaving,
    // validationErrors
  } = useSettings({ category: selectedCategory || undefined })

  const filteredCategories = SETTINGS_CATEGORIES.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'required' && category.isRequired) ||
                         (filterType === 'advanced' && category.isAdvanced)
    
    return matchesSearch && matchesFilter
  })

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const handleBack = () => {
    setSelectedCategory(null)
    onBack?.()
  }

  const handleSaveSettings = async (values: Record<string, any>) => {
    if (!selectedCategory) return
    
    try {
      await updateCategorySettings(values)
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw error
    }
  }

  const handleResetSettings = async () => {
    if (!selectedCategory) return
    
    try {
      await resetSettings(selectedCategory)
    } catch (error) {
      console.error('Failed to reset settings:', error)
      throw error
    }
  }

  // Mock settings fields for demonstration
  const getSettingsFields = (categoryId: string) => {
    switch (categoryId) {
      case 'general':
        return [
          {
            key: 'siteTitle',
            label: 'Site Title',
            description: 'The name of your website',
            type: 'text' as const,
            required: true,
            placeholder: 'Enter site title',
            defaultValue: 'JA-CMS'
          },
          {
            key: 'siteTagline',
            label: 'Site Tagline',
            description: 'A short description of your website',
            type: 'text' as const,
            placeholder: 'Enter site tagline',
            defaultValue: 'Modern Content Management System'
          },
          {
            key: 'adminEmail',
            label: 'Admin Email',
            description: 'Primary administrator email address',
            type: 'email' as const,
            required: true,
            placeholder: 'admin@example.com',
            defaultValue: 'admin@jacms.com'
          },
          {
            key: 'allowRegistration',
            label: 'Allow User Registration',
            description: 'Enable public user registration',
            type: 'boolean' as const,
            defaultValue: false
          },
          {
            key: 'requireEmailVerification',
            label: 'Require Email Verification',
            description: 'Users must verify their email before accessing',
            type: 'boolean' as const,
            defaultValue: true
          },
          {
            key: 'allowComments',
            label: 'Allow Comments',
            description: 'Enable comments on posts and pages',
            type: 'boolean' as const,
            defaultValue: true
          },
          {
            key: 'timezone',
            label: 'Timezone',
            description: 'Default timezone for the site',
            type: 'select' as const,
            options: [
              { value: 'UTC', label: 'UTC' },
              { value: 'Asia/Jakarta', label: 'Asia/Jakarta' },
              { value: 'America/New_York', label: 'America/New_York' },
              { value: 'Europe/London', label: 'Europe/London' }
            ],
            defaultValue: 'Asia/Jakarta'
          }
        ]
      
      case 'content':
        return [
          {
            key: 'postsPerPage',
            label: 'Posts Per Page',
            description: 'Number of posts to display per page',
            type: 'number' as const,
            required: true,
            validation: { min: 1, max: 100 },
            defaultValue: 10
          },
          {
            key: 'defaultPostStatus',
            label: 'Default Post Status',
            description: 'Default status for new posts',
            type: 'select' as const,
            options: [
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'private', label: 'Private' }
            ],
            defaultValue: 'draft'
          },
          {
            key: 'autoSaveInterval',
            label: 'Auto Save Interval',
            description: 'Minutes between auto-saves',
            type: 'number' as const,
            validation: { min: 1, max: 60 },
            defaultValue: 5
          },
          {
            key: 'maxUploadSize',
            label: 'Maximum Upload Size',
            description: 'Maximum file upload size in MB',
            type: 'number' as const,
            validation: { min: 1, max: 100 },
            defaultValue: 10
          }
        ]
      
      case 'email':
        return [
          {
            key: 'smtpEnabled',
            label: 'Enable SMTP',
            description: 'Use SMTP for sending emails',
            type: 'boolean' as const,
            defaultValue: false
          },
          {
            key: 'smtpHost',
            label: 'SMTP Host',
            description: 'SMTP server hostname',
            type: 'text' as const,
            placeholder: 'smtp.gmail.com',
            defaultValue: ''
          },
          {
            key: 'smtpPort',
            label: 'SMTP Port',
            description: 'SMTP server port',
            type: 'number' as const,
            validation: { min: 1, max: 65535 },
            defaultValue: 587
          },
          {
            key: 'smtpUsername',
            label: 'SMTP Username',
            description: 'SMTP authentication username',
            type: 'text' as const,
            placeholder: 'your-email@gmail.com',
            defaultValue: ''
          },
          {
            key: 'smtpPassword',
            label: 'SMTP Password',
            description: 'SMTP authentication password',
            type: 'password' as const,
            isSensitive: true,
            defaultValue: ''
          },
          {
            key: 'fromEmail',
            label: 'From Email',
            description: 'Default sender email address',
            type: 'email' as const,
            placeholder: 'noreply@example.com',
            defaultValue: 'noreply@jacms.com'
          }
        ]
      
      default:
        return [
          {
            key: 'setting1',
            label: 'Sample Setting',
            description: 'This is a sample setting field',
            type: 'text' as const,
            placeholder: 'Enter value',
            defaultValue: ''
          }
        ]
    }
  }

  // const getSettingsValues = (categoryId: string) => {
  //   // Mock values - in real app, these would come from API
  //   const mockValues: Record<string, Record<string, any>> = {
  //     general: {
  //       siteTitle: 'JA-CMS',
  //       siteTagline: 'Modern Content Management System',
  //       adminEmail: 'admin@jacms.com',
  //       allowRegistration: false,
  //       requireEmailVerification: true,
  //       allowComments: true,
  //       timezone: 'Asia/Jakarta'
  //     },
  //     content: {
  //       postsPerPage: 10,
  //       defaultPostStatus: 'draft',
  //       autoSaveInterval: 5,
  //       maxUploadSize: 10
  //     },
  //     email: {
  //       smtpEnabled: false,
  //       smtpHost: '',
  //       smtpPort: 587,
  //       smtpUsername: '',
  //       smtpPassword: '',
  //       fromEmail: 'noreply@jacms.com'
  //     }
  //   }
    
  //   return mockValues[categoryId] || {}
  // }

  if (selectedCategory) {
    const category = SETTINGS_CATEGORIES.find(c => c.id === selectedCategory)
    const fields = getSettingsFields(selectedCategory)
    // const values = getSettingsValues(selectedCategory)

    return (
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{category?.name}</h2>
            <p className="text-muted-foreground">{category?.description}</p>
          </div>
        </div>

        {/* Settings Form */}
        <SettingsForm
          category={selectedCategory}
          title={category?.name || 'Settings'}
          description={category?.description}
          fields={fields}
          values={settings}
          onSave={handleSaveSettings}
          onReset={handleResetSettings}
          isLoading={isLoading || isSaving}
        />
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Configure all aspects of your JA-CMS system
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search settings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Settings</SelectItem>
            <SelectItem value="required">Required</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Settings Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <SettingsCard
            key={category.id}
            category={category}
            onOpen={handleCategorySelect}
          />
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No settings categories found matching your criteria.
        </div>
      )}
    </div>
  )
}
