'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { cn } from '@/lib/cn'

interface SpacingValue {
  top: string
  right: string
  bottom: string
  left: string
}

interface SpacingControlProps {
  setting: {
    id: string
    label: string
    description?: string
    value: SpacingValue
    default: SpacingValue
  }
  value: SpacingValue
  onChange: (value: SpacingValue) => void
}

export function SpacingControl({ setting, value, onChange }: SpacingControlProps) {
  const spacingUnits = ['px', 'rem', 'em', '%', 'vh', 'vw']

  const handleChange = (field: keyof SpacingValue, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    })
  }

  const handleLinkedChange = (newValue: string) => {
    onChange({
      top: newValue,
      right: newValue,
      bottom: newValue,
      left: newValue
    })
  }

  const isLinked = value.top === value.right && value.right === value.bottom && value.bottom === value.left

  const getValueNumber = (spacing: string) => {
    return parseFloat(spacing.replace(/[^\d.]/g, '')) || 0
  }

  const getValueUnit = (spacing: string) => {
    return spacing.replace(/[\d.]/g, '') || 'rem'
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

        {/* Linked Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`${setting.id}-linked`}
            checked={isLinked}
            onChange={(e) => {
              if (e.target.checked) {
                handleLinkedChange(value.top)
              }
            }}
            className="rounded"
          />
          <Label htmlFor={`${setting.id}-linked`} className="text-xs">
            Link all sides
          </Label>
        </div>

        {/* Spacing Controls */}
        <div className="space-y-3">
          {/* Top */}
          <div className="flex items-center gap-2">
            <Label className="text-xs font-medium w-8">Top</Label>
            <Input
              type="number"
              value={getValueNumber(value.top)}
              onChange={(e) => {
                const unit = getValueUnit(value.top)
                const newValue = `${e.target.value}${unit}`
                if (isLinked) {
                  handleLinkedChange(newValue)
                } else {
                  handleChange('top', newValue)
                }
              }}
              className="flex-1"
              min={0}
              step={0.1}
            />
            <Select
              value={getValueUnit(value.top)}
              onValueChange={(unit) => {
                const number = getValueNumber(value.top)
                const newValue = `${number}${unit}`
                if (isLinked) {
                  handleLinkedChange(newValue)
                } else {
                  handleChange('top', newValue)
                }
              }}
            >
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {spacingUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <Label className="text-xs font-medium w-8">Right</Label>
            <Input
              type="number"
              value={getValueNumber(value.right)}
              onChange={(e) => {
                const unit = getValueUnit(value.right)
                const newValue = `${e.target.value}${unit}`
                if (isLinked) {
                  handleLinkedChange(newValue)
                } else {
                  handleChange('right', newValue)
                }
              }}
              className="flex-1"
              min={0}
              step={0.1}
            />
            <Select
              value={getValueUnit(value.right)}
              onValueChange={(unit) => {
                const number = getValueNumber(value.right)
                const newValue = `${number}${unit}`
                if (isLinked) {
                  handleLinkedChange(newValue)
                } else {
                  handleChange('right', newValue)
                }
              }}
            >
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {spacingUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bottom */}
          <div className="flex items-center gap-2">
            <Label className="text-xs font-medium w-8">Bottom</Label>
            <Input
              type="number"
              value={getValueNumber(value.bottom)}
              onChange={(e) => {
                const unit = getValueUnit(value.bottom)
                const newValue = `${e.target.value}${unit}`
                if (isLinked) {
                  handleLinkedChange(newValue)
                } else {
                  handleChange('bottom', newValue)
                }
              }}
              className="flex-1"
              min={0}
              step={0.1}
            />
            <Select
              value={getValueUnit(value.bottom)}
              onValueChange={(unit) => {
                const number = getValueNumber(value.bottom)
                const newValue = `${number}${unit}`
                if (isLinked) {
                  handleLinkedChange(newValue)
                } else {
                  handleChange('bottom', newValue)
                }
              }}
            >
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {spacingUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Left */}
          <div className="flex items-center gap-2">
            <Label className="text-xs font-medium w-8">Left</Label>
            <Input
              type="number"
              value={getValueNumber(value.left)}
              onChange={(e) => {
                const unit = getValueUnit(value.left)
                const newValue = `${e.target.value}${unit}`
                if (isLinked) {
                  handleLinkedChange(newValue)
                } else {
                  handleChange('left', newValue)
                }
              }}
              className="flex-1"
              min={0}
              step={0.1}
            />
            <Select
              value={getValueUnit(value.left)}
              onValueChange={(unit) => {
                const number = getValueNumber(value.left)
                const newValue = `${number}${unit}`
                if (isLinked) {
                  handleLinkedChange(newValue)
                } else {
                  handleChange('left', newValue)
                }
              }}
            >
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {spacingUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="p-3 bg-muted rounded-lg">
          <Label className="text-xs font-medium mb-2 block">Preview</Label>
          <div className="relative w-full h-20 bg-white border rounded">
            <div
              className="absolute inset-0 bg-primary/20"
              style={{
                margin: `${value.top} ${value.right} ${value.bottom} ${value.left}`
              }}
            />
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
