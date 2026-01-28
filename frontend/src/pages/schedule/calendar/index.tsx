import { Card, CardContent } from '@/components/ui/card'
import { useProfessional } from '@/contexts/professional-context'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DayCard } from './components'
import { CalendarToolbar } from './components/calendar-toolbar'
import { DayScheduleGrid } from './components/day-schedule-grid'
import { WeekScheduleGrid } from './components/week-schedule-grid'
import type { CalendarFilters, ViewMode } from './types'
import { getMonthDays, getWeekDays } from './utils'

export function ScheduleCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
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

  const { currentProfessionalSchedules, handleFetchProfessionalSchedules } =
    useProfessional()

  useEffect(() => {
    handleFetchProfessionalSchedules()
  }, [])

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)

    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
        break
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
    }

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
    switch (viewMode) {
      case 'day':
        return (
          <DayScheduleGrid
            date={currentDate}
            schedules={filteredAppointments || []}
          />
        )

      case 'week':
        const weekDays = getWeekDays(currentDate)
        return (
          <WeekScheduleGrid
            weekDays={weekDays}
            schedules={currentProfessionalSchedules} // Passamos o schedule completo aqui
          />
        )

      case 'month':
        const monthDays = getMonthDays(currentDate)
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground p-2"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((date, index) => {
                const isCurrentMonth =
                  date.getMonth() === currentDate.getMonth()
                return (
                  <DayCard
                    key={index}
                    date={date}
                    schedules={filteredAppointments}
                    viewMode="month"
                    isCurrentMonth={isCurrentMonth}
                  />
                )
              })}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden p-6">
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
          onViewModeChange={setViewMode}
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
  )
}
