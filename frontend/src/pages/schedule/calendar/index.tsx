import { appointmentsServices } from '@/api/endpoints/appointments'
import type { FetchProfessionalSchedulesListResponse } from '@/api/endpoints/appointments/dto'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useProfessional } from '@/contexts/professional-context'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { CalendarToolbar } from './components/calendar-toolbar'
import { WeekScheduleGrid } from './components/week-schedule-grid'
import type { CalendarFilters, ViewMode } from './types'
import { getWeekDays } from './utils'

export function ScheduleCalendarPage() {
  const { user } = useAuth()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedPatient, setSelectedPatient] = useState('all')

  const viewMode: ViewMode = 'week'

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

  const {
    currentProfessionalSchedules,
    handleSetIsProfessionalContextLoading,
    handleSetCurrentProfessionalSchedules,
  } = useProfessional()

  const handleFetchProfessionalSchedules = useCallback(async () => {
    if (!user) return
    handleSetIsProfessionalContextLoading(true)
    try {
      if (!user.professional_id) {
        console.error('Usuário não é um profissional ou não existe.')
        return
      }
      const firstResponse: FetchProfessionalSchedulesListResponse =
        await appointmentsServices.fetchAppointmentsByProfessional(
          user.professional_id,
          1,
        )

      const allAppointments = [...firstResponse.appointments]
      const total = firstResponse.pages

      // Fetch remaining pages in parallel
      if (total > 1) {
        const remainingPages = Array.from(
          { length: total - 1 },
          (_, i) => i + 2,
        )

        const remainingResponses = await Promise.all(
          remainingPages.map((page) =>
            appointmentsServices.fetchAppointmentsByProfessional(
              user.professional_id!,
              page,
            ),
          ),
        )

        remainingResponses.forEach((response) => {
          allAppointments.push(...response.appointments)
        })
      }

      console.log('agendamentos carregados:', allAppointments)

      handleSetCurrentProfessionalSchedules(allAppointments)
    } catch (error) {
      console.error('Erro ao buscar horários do profissional:', error)
    } finally {
      handleSetIsProfessionalContextLoading(false)
    }
  }, [])

  useEffect(() => {
    handleFetchProfessionalSchedules()
  }, [])

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
  }

  const goToToday = () => setCurrentDate(new Date())

  const uniquePatients = currentProfessionalSchedules
    ? Array.from(new Set(currentProfessionalSchedules.map((item) => item.name)))
    : []

  const renderCalendar = () => {
    const weekDays = getWeekDays(currentDate)
    return (
      <WeekScheduleGrid
        weekDays={weekDays}
        schedule={currentProfessionalSchedules ?? []}
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
          <div className="flex items-center gap-3 shrink-0 pb-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">
              {currentProfessionalSchedules?.length ?? 0}
            </span>
            <span className="text-muted-foreground">agendamentos totais</span>
          </div>

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
