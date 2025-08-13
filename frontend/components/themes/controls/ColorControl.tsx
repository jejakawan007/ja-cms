'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/cn'

interface ColorControlProps {
  setting: {
    id: string
    label: string
    description?: string
    value: string
    default: string
  }
  value: string
  onChange: (value: string) => void
}

export function ColorControl({ setting, value, onChange }: ColorControlProps) {
  const [isOpen, setIsOpen] = useState(false)

  const presetColors = [
    '#0073aa', '#005a87', '#ffffff', '#333333', '#666666',
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff',
    '#00ffff', '#ffa500', '#800080', '#008000', '#ffc0cb'
  ]

  const handleColorChange = (color: string) => {
    onChange(color)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
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

        <div className="flex items-center gap-2">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-12 h-10 p-0 border-2"
                style={{ backgroundColor: value }}
              >
                <span className="sr-only">Pick color</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Preset Colors</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={cn(
                          'w-8 h-8 rounded border-2 transition-all',
                          value === color ? 'border-primary scale-110' : 'border-gray-300 hover:scale-105'
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Custom Color</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="color"
                      value={value}
                      onChange={handleInputChange}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={value}
                      onChange={handleInputChange}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder="#000000"
            className="flex-1"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Current: {value}</span>
          {value !== setting.default && (
            <button
              onClick={() => onChange(setting.default)}
              className="text-primary hover:underline"
            >
              Reset to Default
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
