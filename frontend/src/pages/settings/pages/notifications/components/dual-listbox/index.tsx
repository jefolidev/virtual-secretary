import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { NotificationType } from '@/types/user'

interface DualListBoxProps {
  available: { key: NotificationType; label: string }[]
  active: { key: NotificationType; label: string }[]
  onActiveChange: (active: NotificationType[]) => void
  availableLabel?: string
  activeLabel?: string
}

export default function DualListBox({
  available,
  active,
  onActiveChange,
  availableLabel = 'Available',
  activeLabel = 'Active',
}: DualListBoxProps) {
  const [selectedAvailable, setSelectedAvailable] = useState<
    { key: NotificationType; label: string }[]
  >([])
  const [selectedActive, setSelectedActive] = useState<
    { key: NotificationType; label: string }[]
  >([])

  const handleToggleAvailable = (item: {
    key: NotificationType
    label: string
  }) => {
    setSelectedAvailable((prev) =>
      prev.find((i) => i.key === item.key)
        ? prev.filter((i) => i.key !== item.key)
        : [...prev, item]
    )
  }

  const handleToggleActive = (item: {
    key: NotificationType
    label: string
  }) => {
    setSelectedActive((prev) =>
      prev.find((i) => i.key === item.key)
        ? prev.filter((i) => i.key !== item.key)
        : [...prev, item]
    )
  }

  const moveToActive = () => {
    const newActive = [...active, ...selectedAvailable]
    onActiveChange(newActive.map((item) => item.key))
    setSelectedAvailable([])
  }

  const moveAllToActive = () => {
    const newActive = [...active, ...available.map((item) => item)]
    onActiveChange(newActive.map((item) => item.key))
    setSelectedAvailable([])
  }

  const moveToAvailable = () => {
    const newActive = active.filter(
      (item) => !selectedActive.find((selected) => selected.key === item.key)
    )
    onActiveChange(newActive.map((item) => item.key))
    setSelectedActive([])
  }

  const moveAllToAvailable = () => {
    onActiveChange([])
    setSelectedActive([])
  }

  return (
    <div className="flex items-center gap-4">
      {/* Available List */}
      <div className="flex-1 space-y-2">
        <Label className="text-sm font-medium text-foreground">
          {availableLabel}
        </Label>
        <div className="border border-input rounded-md bg-card shadow-sm min-h-75 max-h-30 overflow-y-auto">
          {available.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Todas notificações estão ativas
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {available.map((item) => (
                <div
                  key={item.key}
                  onClick={() => handleToggleAvailable(item)}
                  className={cn(
                    'px-3 py-2 rounded-md cursor-pointer transition-all text-sm',
                    'hover:bg-accent hover:text-accent-foreground',
                    selectedAvailable.find(
                      (selected) => selected.key === item.key
                    )
                      ? 'bg-primary text-primary-foreground'
                      : 'text-card-foreground'
                  )}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Arrow Buttons */}
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={moveAllToActive}
          disabled={available.length === 0}
          title="Move all to active"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={moveToActive}
          disabled={selectedAvailable.length === 0}
          title="Move selected to active"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={moveToAvailable}
          disabled={selectedActive.length === 0}
          title="Move selected to available"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={moveAllToAvailable}
          disabled={active.length === 0}
          title="Move all to available"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Active List */}
      <div className="flex-1 space-y-2">
        <Label className="text-sm font-medium text-foreground">
          {activeLabel}
        </Label>
        <div className="border border-input rounded-md bg-card shadow-sm min-h-75 max-h-30 overflow-y-auto">
          {active.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Sem notificações ativas
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {active.map((item) => (
                <div
                  key={item.key}
                  onClick={() => handleToggleActive(item)}
                  className={cn(
                    'px-3 py-2 rounded-md cursor-pointer transition-all text-sm',
                    'hover:bg-accent hover:text-accent-foreground',
                    selectedActive.find((selected) => selected.key === item.key)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-card-foreground'
                  )}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
