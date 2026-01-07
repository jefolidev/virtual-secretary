import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ChevronRight, Filter, Users } from 'lucide-react'
import type { CalendarFilters, ViewMode } from '../../types'
import { getWeekDays } from '../../utils'

interface CalendarToolbarProps {
  currentDate: Date
  viewMode: ViewMode
  selectedPatient: string
  filters: CalendarFilters
  uniquePatients: string[]
  onDateNavigate: (direction: 'prev' | 'next') => void
  onGoToToday: () => void
  onViewModeChange: (mode: ViewMode) => void
  onPatientChange: (patient: string) => void
  onFiltersChange: (filters: CalendarFilters) => void
}

export function CalendarToolbar({
  currentDate,
  viewMode,
  selectedPatient,
  filters,
  uniquePatients,
  onDateNavigate,
  onGoToToday,
  onViewModeChange,
  onPatientChange,
  onFiltersChange,
}: CalendarToolbarProps) {
  // Formatar data para exibição
  const getDateDisplay = () => {
    if (viewMode === 'week') {
      const weekDays = getWeekDays(currentDate)
      const startDate = weekDays[0].getDate()
      const endDate = weekDays[6].getDate()
      const monthYear = new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
      }).format(currentDate)
      return `${startDate} - ${endDate} ${monthYear}`
    }

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }

    return new Intl.DateTimeFormat('pt-BR', options).format(currentDate)
  }

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap overflow-hidden shrink-0">
      {/* Navegação de data */}
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        <Button variant="outline" onClick={onGoToToday}>
          Hoje
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDateNavigate('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-center px-4 min-w-0">
            <span className="font-medium truncate">{getDateDisplay()}</span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onDateNavigate('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Controles direita */}
      <div className="flex items-center gap-2 flex-wrap shrink-0 min-w-0">
        {/* Botões de visualização */}
        <div className="flex rounded-md border">
          <Button
            variant={viewMode === 'day' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('day')}
            className="rounded-r-none"
          >
            Dia
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('week')}
            className="rounded-none"
          >
            Semana
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('month')}
            className="rounded-l-none"
          >
            Mês
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Select de pacientes */}
        <Select value={selectedPatient} onValueChange={onPatientChange}>
          <SelectTrigger className="w-auto min-w-0 max-w-50">
            <div className="flex items-center gap-2 min-w-0">
              <Users className="h-4 w-4 shrink-0" />
              <div className="min-w-0 truncate">
                <SelectValue placeholder="Todos os Pacientes" />
              </div>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Pacientes</SelectItem>
            {uniquePatients.map((patient) => (
              <SelectItem key={patient} value={patient}>
                {patient}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtros */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 max-h-80 overflow-y-auto"
          >
            <DropdownMenuLabel>Status dos Agendamentos</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.showAgendado}
              onCheckedChange={(checked) =>
                onFiltersChange({
                  ...filters,
                  showAgendado: checked ?? false,
                })
              }
            >
              Agendado
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.showConfirmado}
              onCheckedChange={(checked) =>
                onFiltersChange({
                  ...filters,
                  showConfirmado: checked ?? false,
                })
              }
            >
              Confirmado
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.showPago}
              onCheckedChange={(checked) =>
                onFiltersChange({
                  ...filters,
                  showPago: checked ?? false,
                })
              }
            >
              Pago
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.showFinalizado}
              onCheckedChange={(checked) =>
                onFiltersChange({
                  ...filters,
                  showFinalizado: checked ?? false,
                })
              }
            >
              Finalizado
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.showNaoPago}
              onCheckedChange={(checked) =>
                onFiltersChange({
                  ...filters,
                  showNaoPago: checked ?? false,
                })
              }
            >
              Não Pago
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.showNoShow}
              onCheckedChange={(checked) =>
                onFiltersChange({
                  ...filters,
                  showNoShow: checked ?? false,
                })
              }
            >
              No-Show
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.showRemarcado}
              onCheckedChange={(checked) =>
                onFiltersChange({
                  ...filters,
                  showRemarcado: checked ?? false,
                })
              }
            >
              Remarcado
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.showCancelado}
              onCheckedChange={(checked) =>
                onFiltersChange({
                  ...filters,
                  showCancelado: checked ?? false,
                })
              }
            >
              Cancelado
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
