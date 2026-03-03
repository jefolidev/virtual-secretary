import { appointmentsServices } from '@/api/endpoints/appointments'
import type {
  FetchProfessionalSchedulesListResponse,
  FetchProfessionalSchedulesResponse,
} from '@/api/endpoints/appointments/dto'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useState } from 'react'
import { useAuth } from './auth-context'

interface ProfessionalContextType {
  isProfessionalContextLoading: boolean
  currentProfessionalSchedules: FetchProfessionalSchedulesResponse[] | null
  totalPages: number

  handleFetchProfessionalSchedules: () => Promise<void>
  handleSetCurrentProfessionalSchedules: (
    schedules: FetchProfessionalSchedulesResponse[] | null,
  ) => void
  handleSetIsProfessionalContextLoading: (loading: boolean) => void
}

const ProfessionalContext = createContext<ProfessionalContextType | undefined>(
  undefined,
)

export function ProfessionalProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const [currentProfessionalSchedules, setCurrentProfessionalSchedules] =
    useState<FetchProfessionalSchedulesResponse[] | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [isProfessionalContextLoading, setIsProfessionalContextLoading] =
    useState(true)

  const handleFetchProfessionalSchedules = useCallback(async () => {
    if (!user) return
    setIsProfessionalContextLoading(true)
    try {
      if (!user.professional_id) {
        console.error('Usuário não é um profissional ou não existe.')
        return
      }
      const response: FetchProfessionalSchedulesListResponse =
        await appointmentsServices.fetchAppointmentsByProfessional(
          user.professional_id,
        )
      setCurrentProfessionalSchedules(response.appointments)
      setTotalPages(response.pages)
    } catch (error) {
      console.error('Erro ao buscar horários do profissional:', error)
    } finally {
      setIsProfessionalContextLoading(false)
    }
  }, [user])

  const handleSetCurrentProfessionalSchedules = (
    schedules: FetchProfessionalSchedulesResponse[] | null,
  ) => {
    setCurrentProfessionalSchedules(schedules)
  }

  const handleSetIsProfessionalContextLoading = (loading: boolean) => {
    setIsProfessionalContextLoading(loading)
  }

  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ProfessionalContext.Provider
        value={{
          isProfessionalContextLoading,
          currentProfessionalSchedules,
          totalPages,

          handleFetchProfessionalSchedules,
          handleSetCurrentProfessionalSchedules,
          handleSetIsProfessionalContextLoading,
        }}
      >
        {children}
      </ProfessionalContext.Provider>
    </QueryClientProvider>
  )
}

export function useProfessional() {
  const context = useContext(ProfessionalContext)
  if (context === undefined) {
    throw new Error(
      'useProfessional deve ser usado dentro de um ProfessionalProvider',
    )
  }
  return context
}
