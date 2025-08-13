'use client'

import { useState, useRef } from 'react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { 
  Palette, 
  Type, 
  Layout, 
  Eye, 
  Save, 
  RotateCcw, 
  Smartphone, 
  Tablet, 
  Monitor,
  Download,
  Upload
} from 'lucide-react'
import { TypographyControl } from './controls/TypographyControl'
import { ColorControl } from './controls/ColorControl'
import { SpacingControl } from './controls/SpacingControl'
import { LayoutControl } from './controls/LayoutControl'

import { cn } from '@/lib/cn'

interface CustomizerSetting {
  id: string
  type: 'color' | 'typography' | 'spacing' | 'layout' | 'image' | 'text' | 'number' | 'select'
  label: string
  description?: string
  value: any
  default: any
  section: string
  transport: 'refresh' | 'postMessage'
  choices?: Record<string, string>
  min?: number
  max?: number
  step?: number
}

interface CustomizerSection {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  settings: CustomizerSetting[]
}

interface ThemeCustomizerProps {
  onSave?: (settings: Record<string, any>) => Promise<void>
  onReset?: () => void
  className?: string
}

export function ThemeCustomizer({ 
  onSave, 
  onReset, 
  className 
}: ThemeCustomizerProps) {
  // Theme Customizer API integration
  // const {
  //   config,
  //   settings: apiSettings,
  //   state,
  //   isLoading,
  //   error,
  //   updateSetting,
  //   saveChanges,
  //   publishChanges,
  //   exportTheme,
  //   importTheme,
  //   getPreviewUrl,
  //   setDevice,
  //   setSection
  // } = useThemeCustomizer({ autoLoad: true, autoSave: true })
  
  const [activeSection, setActiveSection] = useState<string>('colors')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isPreviewVisible, setIsPreviewVisible] = useState(true)
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const previewRef = useRef<HTMLIFrameElement>(null)

  // Mock customizer sections
  const sections: CustomizerSection[] = [
    {
      id: 'colors',
      title: 'Colors',
      description: 'Customize color scheme and branding',
      icon: <Palette className="h-4 w-4" />,
      settings: [
        {
          id: 'primary_color',
          type: 'color',
          label: 'Primary Color',
          description: 'Main brand color used throughout the site',
          value: '#0073aa',
          default: '#0073aa',
          section: 'colors',
          transport: 'postMessage'
        },
        {
          id: 'secondary_color',
          type: 'color',
          label: 'Secondary Color',
          description: 'Accent color for highlights and buttons',
          value: '#005a87',
          default: '#005a87',
          section: 'colors',
          transport: 'postMessage'
        },
        {
          id: 'background_color',
          type: 'color',
          label: 'Background Color',
          description: 'Main background color',
          value: '#ffffff',
          default: '#ffffff',
          section: 'colors',
          transport: 'postMessage'
        },
        {
          id: 'text_color',
          type: 'color',
          label: 'Text Color',
          description: 'Primary text color',
          value: '#333333',
          default: '#333333',
          section: 'colors',
          transport: 'postMessage'
        }
      ]
    },
    {
      id: 'typography',
      title: 'Typography',
      description: 'Font families, sizes, and spacing',
      icon: <Type className="h-4 w-4" />,
      settings: [
        {
          id: 'heading_font',
          type: 'typography',
          label: 'Heading Font',
          description: 'Font family for headings',
          value: {
            family: 'Inter',
            weight: '600',
            size: '32px',
            lineHeight: '1.2',
            letterSpacing: '0px',
            transform: 'none'
          },
          default: {
            family: 'Inter',
            weight: '600',
            size: '32px',
            lineHeight: '1.2',
            letterSpacing: '0px',
            transform: 'none'
          },
          section: 'typography',
          transport: 'postMessage'
        },
        {
          id: 'body_font',
          type: 'typography',
          label: 'Body Font',
          description: 'Font family for body text',
          value: {
            family: 'Inter',
            weight: '400',
            size: '16px',
            lineHeight: '1.6',
            letterSpacing: '0px',
            transform: 'none'
          },
          default: {
            family: 'Inter',
            weight: '400',
            size: '16px',
            lineHeight: '1.6',
            letterSpacing: '0px',
            transform: 'none'
          },
          section: 'typography',
          transport: 'postMessage'
        }
      ]
    },
    {
      id: 'spacing',
      title: 'Spacing',
      description: 'Margins, padding, and layout spacing',
      icon: <Layout className="h-4 w-4" />,
      settings: [
        {
          id: 'container_padding',
          type: 'spacing',
          label: 'Container Padding',
          description: 'Padding around main content container',
          value: {
            top: '2rem',
            right: '2rem',
            bottom: '2rem',
            left: '2rem'
          },
          default: {
            top: '2rem',
            right: '2rem',
            bottom: '2rem',
            left: '2rem'
          },
          section: 'spacing',
          transport: 'postMessage'
        },
        {
          id: 'section_spacing',
          type: 'spacing',
          label: 'Section Spacing',
          description: 'Spacing between sections',
          value: {
            top: '4rem',
            right: '0',
            bottom: '4rem',
            left: '0'
          },
          default: {
            top: '4rem',
            right: '0',
            bottom: '4rem',
            left: '0'
          },
          section: 'spacing',
          transport: 'postMessage'
        }
      ]
    },
    {
      id: 'layout',
      title: 'Layout',
      description: 'Page layout and structure settings',
      icon: <Layout className="h-4 w-4" />,
      settings: [
        {
          id: 'container_width',
          type: 'select',
          label: 'Container Width',
          description: 'Maximum width of content container',
          value: '1200px',
          default: '1200px',
          section: 'layout',
          transport: 'postMessage',
          choices: {
            '1000px': 'Narrow (1000px)',
            '1200px': 'Standard (1200px)',
            '1400px': 'Wide (1400px)',
            '100%': 'Full Width'
          }
        },
        {
          id: 'sidebar_position',
          type: 'select',
          label: 'Sidebar Position',
          description: 'Position of sidebar on pages',
          value: 'right',
          default: 'right',
          section: 'layout',
          transport: 'postMessage',
          choices: {
            'left': 'Left',
            'right': 'Right',
            'none': 'No Sidebar'
          }
        }
      ]
    }
  ]

  const currentSection = sections.find(s => s.id === activeSection)

  const handleSettingChange = (settingId: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: value
    }))
    setHasChanges(true)

    // Update preview
    updatePreview(settingId, value)
  }

  const updatePreview = (settingId: string, value: any) => {
    if (previewRef.current?.contentWindow) {
      previewRef.current.contentWindow.postMessage({
        type: 'customizer-setting-update',
        settingId,
        value
      }, '*')
    }
  }

  const handleSave = async () => {
    if (!onSave) return

    try {
      await onSave(settings)
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save customizer settings:', error)
    }
  }

  const handleReset = () => {
    setSettings({})
    setHasChanges(false)
    onReset?.()
  }

  const getPreviewDimensions = () => {
    switch (previewDevice) {
      case 'mobile':
        return { width: '375px', height: '667px' }
      case 'tablet':
        return { width: '768px', height: '1024px' }
      case 'desktop':
        return { width: '100%', height: '100%' }
      default:
        return { width: '100%', height: '100%' }
    }
  }

  const renderControl = (setting: CustomizerSetting) => {
    switch (setting.type) {
      case 'color':
        return (
          <ColorControl
            key={setting.id}
            setting={setting}
            value={settings[setting.id] || setting.value}
            onChange={(value) => handleSettingChange(setting.id, value)}
          />
        )
      case 'typography':
        return (
          <TypographyControl
            key={setting.id}
            setting={setting}
            value={settings[setting.id] || setting.value}
            onChange={(value) => handleSettingChange(setting.id, value)}
          />
        )
      case 'spacing':
        return (
          <SpacingControl
            key={setting.id}
            setting={setting}
            value={settings[setting.id] || setting.value}
            onChange={(value) => handleSettingChange(setting.id, value)}
          />
        )
      case 'layout':
      case 'select':
        return (
          <LayoutControl
            key={setting.id}
            setting={setting}
            value={settings[setting.id] || setting.value}
            onChange={(value) => handleSettingChange(setting.id, value)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className={cn('flex h-screen', className)}>
      {/* Customizer Panel */}
      <div className="w-80 border-r bg-background flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme Customizer
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreviewVisible(!isPreviewVisible)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-0">
          {/* Section Navigation */}
          <div className="p-4 border-b">
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  {section.icon}
                  <div>
                    <div className="font-medium">{section.title}</div>
                    {section.description && (
                      <div className="text-xs opacity-80">{section.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section Content */}
          {currentSection && (
            <div className="p-4 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{currentSection.title}</h3>
                {currentSection.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {currentSection.description}
                  </p>
                )}
              </div>

              <div className="space-y-6">
                {currentSection.settings.map(renderControl)}
              </div>
            </div>
          )}
        </CardContent>

        {/* Actions */}
        <div className="p-4 border-t space-y-2">
          {hasChanges && (
            <Badge variant="secondary" className="w-full justify-center">
              Unsaved Changes
            </Badge>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      {isPreviewVisible && (
        <div className="flex-1 flex flex-col">
          {/* Preview Header */}
          <div className="p-4 border-b bg-background">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">Live Preview</span>
                <Badge variant="outline">Real-time</Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Device Preview */}
                <div className="flex items-center gap-1">
                  <Button
                    variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                    title="Desktop View"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('tablet')}
                    title="Tablet View"
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                    title="Mobile View"
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Preview Actions */}
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Frame */}
          <div className="flex-1 bg-muted p-4">
            <div 
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              style={getPreviewDimensions()}
            >
              <iframe
                ref={previewRef}
                src="/preview"
                className="w-full h-full border-0"
                title="Theme Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
