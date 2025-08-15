'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
// import { cn } from '@/lib/cn'

interface LayoutControlProps {
  setting: {
    id: string
    label: string
    description?: string
    value: any
    default: any
    choices?: Record<string, string>
    min?: number
    max?: number
    step?: number
  }
  value: any
  onChange: (value: any) => void
}

export function LayoutControl({ setting, value, onChange }: LayoutControlProps) {
  const handleChange = (newValue: any) => {
    onChange(newValue)
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div>
          <Label htmlFor={setting.id} className="text-sm font-medium">
            {setting.label}
          </Label>
          {setting.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {setting.description}
            </p>
          )}
        </div>

        {setting.choices ? (
          <Select value={value} onValueChange={handleChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(setting.choices).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            min={setting.min}
            max={setting.max}
            step={setting.step}
          />
        )}

        {/* Reset */}
        {value !== setting.default && (
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
