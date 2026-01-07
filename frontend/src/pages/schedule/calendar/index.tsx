import { Card, CardContent } from '@/components/ui/card'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { CalendarToolbar } from './components/calendar-toolbar'
import { DayCard } from './components/day-card'
import { DayScheduleGrid } from './components/day-schedule-grid'
import { WeekScheduleGrid } from './components/week-schedule-grid'
import { mockAppointments } from './mock/data'
import type { CalendarFilters, ViewMode } from './types'
import { getMonthDays, getWeekDays } from './utils'

// Componente principal refatorado
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
  const filteredAppointments = mockAppointments.filter((apt) => {
    const statusFilter =
      (apt.status === 'agendado' && filters.showAgendado) ||
      (apt.status === 'confirmado' && filters.showConfirmado) ||
      (apt.status === 'pago' && filters.showPago) ||
      (apt.status === 'finalizado' && filters.showFinalizado) ||
      (apt.status === 'nao-pago' && filters.showNaoPago) ||
      (apt.status === 'no-show' && filters.showNoShow) ||
      (apt.status === 'remarcado' && filters.showRemarcado) ||
      (apt.status === 'cancelado' && filters.showCancelado)

    const patientFilter =
      selectedPatient === 'all' || apt.patientName === selectedPatient

    return statusFilter && patientFilter
  })

  // Obter lista única de pacientes para o select
  const uniquePatients = [
    ...new Set(mockAppointments.map((apt) => apt.patientName)),
  ]

  const renderCalendar = () => {
    switch (viewMode) {
      case 'day':
        return (
          <DayScheduleGrid
            date={currentDate}
            appointments={filteredAppointments}
          />
        )

      case 'week':
        const weekDays = getWeekDays(currentDate)
        return (
          <WeekScheduleGrid
            weekDays={weekDays}
            appointments={filteredAppointments}
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
                    appointments={filteredAppointments}
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
