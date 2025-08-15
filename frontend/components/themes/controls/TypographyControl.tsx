'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
// import { cn } from '@/lib/cn'

interface TypographyValue {
  family: string
  weight: string
  size: string
  lineHeight: string
  letterSpacing: string
  transform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
}

interface TypographyControlProps {
  setting: {
    id: string
    label: string
    description?: string
    value: TypographyValue
    default: TypographyValue
  }
  value: TypographyValue
  onChange: (value: TypographyValue) => void
}

export function TypographyControl({ setting, value, onChange }: TypographyControlProps) {
  const fontFamilies = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat',
    'Source Sans Pro', 'Raleway', 'Ubuntu', 'Nunito', 'Playfair Display'
  ]

  const fontWeights = [
    { value: '100', label: 'Thin (100)' },
    { value: '300', label: 'Light (300)' },
    { value: '400', label: 'Regular (400)' },
    { value: '500', label: 'Medium (500)' },
    { value: '600', label: 'Semi Bold (600)' },
    { value: '700', label: 'Bold (700)' },
    { value: '900', label: 'Black (900)' }
  ]

  const textTransforms = [
    { value: 'none', label: 'None' },
    { value: 'uppercase', label: 'Uppercase' },
    { value: 'lowercase', label: 'Lowercase' },
    { value: 'capitalize', label: 'Capitalize' }
  ]

  const handleChange = (field: keyof TypographyValue, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    })
  }

  const getFontSizeNumber = (size: string) => {
    return parseInt(size.replace('px', ''))
  }

  const getLineHeightNumber = (lineHeight: string) => {
    return parseFloat(lineHeight)
  }

  const getLetterSpacingNumber = (letterSpacing: string) => {
    return parseFloat(letterSpacing.replace('px', ''))
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div>
          <Label className="text-sm font-medium">
            {setting.label}
          </Label>
          {setting.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {setting.description}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {/* Font Family */}
          <div>
            <Label className="text-xs font-medium">Font Family</Label>
            <Select value={value.family} onValueChange={(val) => handleChange('family', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Weight */}
          <div>
            <Label className="text-xs font-medium">Font Weight</Label>
            <Select value={value.weight} onValueChange={(val) => handleChange('weight', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontWeights.map((weight) => (
                  <SelectItem key={weight.value} value={weight.value}>
                    {weight.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div>
            <Label className="text-xs font-medium">Font Size</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[getFontSizeNumber(value.size)]}
                onValueChange={([size]) => handleChange('size', `${size}px`)}
                min={10}
                max={72}
                step={1}
                className="flex-1"
              />
              <Input
                type="number"
                value={getFontSizeNumber(value.size)}
                onChange={(e) => handleChange('size', `${e.target.value}px`)}
                min={10}
                max={72}
                className="w-16"
              />
              <span className="text-xs text-muted-foreground">px</span>
            </div>
          </div>

          {/* Line Height */}
          <div>
            <Label className="text-xs font-medium">Line Height</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[getLineHeightNumber(value.lineHeight)]}
                onValueChange={([lineHeight]) => handleChange('lineHeight', (lineHeight || 1.5).toString())}
                min={1}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <Input
                type="number"
                value={getLineHeightNumber(value.lineHeight)}
                onChange={(e) => handleChange('lineHeight', e.target.value)}
                min={1}
                max={3}
                step={0.1}
                className="w-16"
              />
            </div>
          </div>

          {/* Letter Spacing */}
          <div>
            <Label className="text-xs font-medium">Letter Spacing</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[getLetterSpacingNumber(value.letterSpacing)]}
                onValueChange={([letterSpacing]) => handleChange('letterSpacing', `${letterSpacing}px`)}
                min={-2}
                max={5}
                step={0.1}
                className="flex-1"
              />
              <Input
                type="number"
                value={getLetterSpacingNumber(value.letterSpacing)}
                onChange={(e) => handleChange('letterSpacing', `${e.target.value}px`)}
                min={-2}
                max={5}
                step={0.1}
                className="w-16"
              />
              <span className="text-xs text-muted-foreground">px</span>
            </div>
          </div>

          {/* Text Transform */}
          <div>
            <Label className="text-xs font-medium">Text Transform</Label>
            <Select value={value.transform} onValueChange={(val) => handleChange('transform', val as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {textTransforms.map((transform) => (
                  <SelectItem key={transform.value} value={transform.value}>
                    {transform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview */}
        <div className="p-3 bg-muted rounded-lg">
          <Label className="text-xs font-medium mb-2 block">Preview</Label>
          <div
            style={{
              fontFamily: value.family,
              fontWeight: value.weight,
              fontSize: value.size,
              lineHeight: value.lineHeight,
              letterSpacing: value.letterSpacing,
              textTransform: value.transform
            }}
            className="text-sm"
          >
            The quick brown fox jumps over the lazy dog
          </div>
        </div>

        {/* Reset */}
        {JSON.stringify(value) !== JSON.stringify(setting.default) && (
          <button
            onClick={() => onChange(setting.default)}
            className="text-xs text-primary hover:underline"
          >
            Reset to Default
          </button>
        )}
      </CardContent>
    </Card>
  )
}
