import type { FetchProfessionalSchedulesSchema } from '@/services/professional/dto/fetch-professional-schedules.dto'
import { professionalServices } from '@/services/professional/endpoints'
import { createContext, useContext, useMemo, useState } from 'react'
import { useAuth } from './auth-context'

interface ProfessionalContextType {
  isProfessionalContextLoading: boolean

  currentProfessionalSchedules: FetchProfessionalSchedulesSchema
  handleFetchProfessionalSchedules: void
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
    useState<FetchProfessionalSchedulesSchema>([])
  const [isProfessionalContextLoading, setIsProfessionalContextLoading] =
    useState(true)

  const handleFetchProfessionalSchedules = useMemo(() => {
    ;async () => {
      if (!user) return

      setIsProfessionalContextLoading(true)
      try {
        if (!user.professional_id) {
          console.error('Usuário não é um profissional ou não existe.')
          return
        }

        const schedules = await professionalServices.getProfessionalSchedules(
          user.professional_id,
        )
        setCurrentProfessionalSchedules(schedules)
      } catch (error) {
        console.error('Erro ao buscar horários do profissional:', error)
      } finally {
        setIsProfessionalContextLoading(false)
      }
    }
  }, [user])

  return (
    <ProfessionalContext.Provider
      value={{
        isProfessionalContextLoading,

        currentProfessionalSchedules,
        handleFetchProfessionalSchedules,
      }}
    >
      {children}
    </ProfessionalContext.Provider>
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
