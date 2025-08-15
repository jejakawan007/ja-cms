'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save, RotateCcw, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { cn } from '@/lib/cn'

interface SettingField {
  key: string
  label: string
  description?: string
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'email' | 'url' | 'password'
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  defaultValue?: any
  isAdvanced?: boolean
  isSensitive?: boolean
}

interface SettingsFormProps {
  category: string
  title: string
  description?: string
  fields: SettingField[]
  values: Record<string, any>
  onSave?: (values: Record<string, any>) => Promise<void>
  onReset?: () => void
  isLoading?: boolean
  className?: string
}

export function SettingsForm({ 
  // category, 
  title, 
  description, 
  fields, 
  values, 
  onSave, 
  onReset, 
  isLoading = false,
  className 
}: SettingsFormProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>(values)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleInputChange = (key: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value
    }))
    
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({
        ...prev,
        [key]: ''
      }))
    }
  }

  const validateField = (field: SettingField, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`
    }

    if (field.validation) {
      const { min, max, pattern } = field.validation
      
      if (min !== undefined && value < min) {
        return `${field.label} must be at least ${min}`
      }
      
      if (max !== undefined && value > max) {
        return `${field.label} must be at most ${max}`
      }
      
      if (pattern && typeof value === 'string') {
        const regex = new RegExp(pattern)
        if (!regex.test(value)) {
          return field.validation.message || `${field.label} format is invalid`
        }
      }
    }

    return null
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    fields.forEach(field => {
      const error = validateField(field, formValues[field.key])
      if (error) {
        newErrors[field.key] = error
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    setSaveStatus('idle')

    try {
      await onSave?.(formValues)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      setSaveStatus('error')
      console.error('Failed to save settings:', error)
      // Show error message to user
      setErrors(prev => ({
        ...prev,
        _general: error instanceof Error ? error.message : 'Failed to save settings'
      }))
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setFormValues(values)
    setErrors({})
    onReset?.()
  }

  const renderField = (field: SettingField) => {
    const value = formValues[field.key] ?? field.defaultValue
    const error = errors[field.key]
    const isAdvanced = field.isAdvanced && !showAdvanced

    if (isAdvanced) {
      return null
    }

    return (
      <div key={field.key} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={field.key} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {field.isSensitive && (
            <Badge variant="outline" className="text-xs">
              Sensitive
            </Badge>
          )}
        </div>
        
        {field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}

        <div className="space-y-1">
          {field.type === 'boolean' ? (
            <div className="flex items-center space-x-2">
              <Switch
                id={field.key}
                checked={value || false}
                onCheckedChange={(checked) => handleInputChange(field.key, checked)}
                disabled={isLoading}
              />
              <span className="text-sm text-muted-foreground">
                {value ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          ) : field.type === 'select' ? (
            <Select
              value={value || ''}
              onValueChange={(val) => handleInputChange(field.key, val)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === 'textarea' ? (
            <Textarea
              id={field.key}
              value={value || ''}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              disabled={isLoading}
              rows={4}
            />
          ) : (
            <Input
              id={field.key}
              type={field.type}
              value={value || ''}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              disabled={isLoading}
            />
          )}
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    )
  }

  const hasAdvancedFields = fields.some(field => field.isAdvanced)

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          {saveStatus === 'success' && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {saveStatus === 'error' && (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          )}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Save Status */}
        {saveStatus === 'success' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Settings saved successfully!
            </AlertDescription>
          </Alert>
        )}
        
        {saveStatus === 'error' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {errors['_general'] || 'Failed to save settings. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Advanced Toggle */}
        {hasAdvancedFields && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Advanced settings are hidden
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </Button>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-6">
          {fields.map(renderField)}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading || isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          
          <Button
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="min-w-[100px]"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
