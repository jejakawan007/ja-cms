'use client'

import { Button } from '@/components/ui/button'
import { 
  LayoutGrid, 
  List, 
  Table, 
  Square 
} from 'lucide-react'
import { cn } from '@/lib/cn'

export type ViewMode = 'card' | 'table' | 'grid' | 'list'

interface ViewToggleProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  className?: string
}

const viewOptions: Array<{
  value: ViewMode
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}> = [
  {
    value: 'card',
    label: 'Cards',
    icon: Square,
    description: 'Card layout with detailed information'
  },
  {
    value: 'table',
    label: 'Table',
    icon: Table,
    description: 'Compact table view for data analysis'
  },
  {
    value: 'grid',
    label: 'Grid',
    icon: LayoutGrid,
    description: 'Masonry grid with featured images'
  },
  {
    value: 'list',
    label: 'List',
    icon: List,
    description: 'Compact list with quick actions'
  }
]

export function ViewToggle({ currentView, onViewChange, className }: ViewToggleProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {viewOptions.map((option) => {
        const Icon = option.icon
        const isActive = currentView === option.value
        
        return (
          <Button
            key={option.value}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewChange(option.value)}
            className={cn(
              'h-8 w-8 p-0 transition-all duration-200',
              isActive && 'shadow-sm'
            )}
            title={option.description}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{option.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
