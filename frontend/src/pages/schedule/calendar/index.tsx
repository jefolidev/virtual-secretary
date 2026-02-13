import { Card, CardContent } from '@/components/ui/card'
import { useSidebar } from '@/components/ui/sidebar'
import { useProfessional } from '@/contexts/professional-context'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CalendarToolbar } from './components/calendar-toolbar'
import { WeekScheduleGrid } from './components/week-schedule-grid'
import type { CalendarFilters, ViewMode } from './types'
import { getWeekDays } from './utils'

export function ScheduleCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const viewMode: ViewMode = 'week'
  const [selectedPatient, setSelectedPatient] = useState('all')
  const [filters, setFilters] = useState<CalendarFilters>({
    showAgendado: true,
    showConfirmado: true,
    showPago: true,
    showFinalizado: true,
    showNaoPago: true,
    showNoShow: false,
    showRemarcado: true,
    showCancelado: true,
  })

  const { state } = useSidebar()

  const { currentProfessionalSchedules, handleFetchProfessionalSchedules } =
    useProfessional()

  useEffect(() => {
    handleFetchProfessionalSchedules()
  }, [])

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)

    // visualização fixa em semana: navegar por 7 dias
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))

    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Filtrar agendamentos baseado nos filtros selecionados
  const filteredAppointments = useMemo(() => {
    return currentProfessionalSchedules.filter((apt) => {
      // Acesse o status de dentro do objeto appointment (verifique se o nome é singular no seu DTO)
      const status = apt.appointments.status

      const statusFilter =
        (status === 'SCHEDULED' && filters.showAgendado) ||
        (status === 'COMPLETED' && filters.showFinalizado) ||
        (status === 'CONFIRMED' && filters.showConfirmado) ||
        (status === 'CANCELLED' && filters.showCancelado) ||
        (status === 'RESCHEDULED' && filters.showRemarcado) ||
        (status === 'NO_SHOW' && filters.showNoShow) ||
        true

      const patientFilter =
        selectedPatient === 'all' || apt.name === selectedPatient

      return statusFilter && patientFilter
    })
  }, [currentProfessionalSchedules, filters, selectedPatient])
  // Obter lista única de pacientes para o select
  const uniquePatients = [
    ...new Set(currentProfessionalSchedules.map((apt) => apt.name)),
  ]

  const renderCalendar = () => {
    const weekDays = getWeekDays(currentDate)
    return (
      <WeekScheduleGrid
        weekDays={weekDays}
        schedules={currentProfessionalSchedules} // Passamos o schedule completo aqui
      />
    )
  }

  return (
    <div className="w-full overflow-x-hidden">
      <div
        style={{
          transform: 'scale(0.7)',
          transformOrigin: '0 0',
          width: '142.857%',
        }}
      >
        <div className="flex flex-col min-h-screen p-6 w-full">
          {/* Cabeçalho com contador */}
          <div className="flex items-center gap-3 shrink-0 pb-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">
              {filteredAppointments.length}
            </span>
            <span className="text-muted-foreground">agendamentos totais</span>
          </div>

          {/* Barra de ferramentas */}
          <div className="shrink-0 pb-2 my-2">
            <CalendarToolbar
              currentDate={currentDate}
              viewMode={viewMode}
              selectedPatient={selectedPatient}
              filters={filters}
              uniquePatients={uniquePatients}
              onDateNavigate={navigateDate}
              onGoToToday={goToToday}
              onPatientChange={setSelectedPatient}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Calendário */}
          <div className="flex-1 min-h-0 pb-4">
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <div className="w-full h-full">{renderCalendar()}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
