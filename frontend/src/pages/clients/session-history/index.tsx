import {
  appointmentsServices,
  type FetchScheduleByProfessionalIdFilters,
} from '@/api/endpoints/appointments'
import type { AddressSchema } from '@/api/schemas/address-schema'
import type { Appointment } from '@/api/schemas/fetch-professional-schedules.dto'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { SessionHistoryItem } from './components/session-history-item'

type FilterPeriodProps = 'all' | 'week' | 'month' | 'year'

type FilterStatusProps =
  | 'all'
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW'
  | 'IN_PROGRESS'
  | 'COMPLETED'

type FilterPaymentStatusProps =
  | 'all'
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED'

type FilterModalityProps = 'all' | 'ONLINE' | 'IN_PERSON'

export type AppointmentsSesions = Appointment & {
  userDetails: {
    name: string
    email: string
    whatsappNumber: string
    cpf: string

    address: AddressSchema
  }
}

export function SessionHistory() {
  const [sessions, setSessions] = useState<AppointmentsSesions[]>([])
  const [filters, setFilters] = useState<FetchScheduleByProfessionalIdFilters>({
    modality: 'all',
    paymentStatus: 'all',
    period: 'all',
    status: 'all',
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const handleFowardPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handleBackwardPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handleJumpToFirstPage = () => {
    setCurrentPage(1)
  }

  const handleJumpToLastPage = () => {
    setCurrentPage(totalPages)
  }

  const { user } = useAuth()

  const { fetchAppointmentsByProfessional } = appointmentsServices

  const loadAppointments = async () => {
    try {
      if (!user?.professional_id) {
        console.warn(
          'Usuário não é um profissional ou ID do profissional não disponível',
        )
        toast.error(
          'Não foi possível carregar os agendamentos. ID do profissional não disponível.',
        )
        return
      }

      const { data } = await fetchAppointmentsByProfessional(
        user?.professional_id,
        currentPage,
        filters,
      )

      setSessions(data.appointments)
      setTotalPages(data.pages)
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [filters, currentPage])

  const [searchTerm, setSearchTerm] = useState('')

  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  const handleFilterChange = (
    filterType: 'period' | 'status' | 'paymentStatus' | 'modality',
    value: string,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const handleSearchByPatientName = (searchedName: string) => {
    setSearchTerm(searchedName)
    return
  }

  const filterPeriod = filters.period as FilterPeriodProps
  const filterStatus = filters.status as FilterStatusProps
  const filterPayment = filters.paymentStatus as FilterPaymentStatusProps
  const filterModality = filters.modality as FilterModalityProps

  const filteredSessions = sessions.filter((session) => {
    if (!searchTerm) return true
    return session.userDetails.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  })

  return (
    <div className="">
      <div className="flex justify-between items-center mb-2 py-6 border-b px-8">
        <div>
          <h1 className="text-3xl font-semibold">Histórico de Sessões</h1>
          <p className="text-sm text-muted-foreground">
            Visualize e gerencie o histórico completo de todas as sessões
            realizadas
          </p>
        </div>

        <div className="flex items-center gap-6 pt-1">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-semibold text-accent-foreground">
              {sessions.length * (totalPages > 1 ? totalPages : 1)}
            </p>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Realizadas</p>
            <p className="text-2xl font-semibold text-accent-foreground">
              {sessions.filter((s) => s.status === 'COMPLETED').length *
                (totalPages > 1 ? totalPages : 1)}
            </p>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Canceladas</p>
            <p className="text-2xl font-semibold text-accent-foreground">
              {sessions.filter((s) => s.status === 'CANCELLED').length *
                (totalPages > 1 ? totalPages : 1)}
            </p>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">No-shows</p>
            <p className="text-2xl font-semibold text-accent-foreground">
              {sessions.filter((s) => s.status === 'NO_SHOW').length *
                (totalPages > 1 ? totalPages : 1)}
            </p>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-semibold text-accent-foreground">
              {sessions.filter((s) => s.paymentStatus === 'PENDING').length *
                (totalPages > 1 ? totalPages : 1)}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-6">
        <div className=" border border-muted/80 dark:border-muted/40 bg-muted/60 dark:bg-muted/30 rounded-xl p-6  mb-6">
          <div className="flex gap-4 items-center mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por paciente"
                value={searchTerm}
                onChange={(e) => handleSearchByPatientName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-accent-foreground mb-2">
                Período
              </label>
              <select
                value={filterPeriod}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todo período</option>
                <option value="last-week">Última semana</option>
                <option value="last-month">Último mês</option>
                <option value="last-year">Último ano</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-accent-foreground mb-2">
                Status da Sessão
              </label>
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="SCHEDULED">Agendada</option>
                <option value="CONFIRMED">Confirmada</option>
                <option value="CANCELLED">Cancelada</option>
                <option value="RESCHEDULED">Remarcada</option>
                <option value="NO_SHOW">No-show</option>
                <option value="IN_PROGRESS">Em andamento</option>
                <option value="COMPLETED">Realizada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-accent-foreground mb-2">
                Status de Pagamento
              </label>
              <select
                value={filterPayment}
                onChange={(e) =>
                  handleFilterChange('paymentStatus', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING">Pendente</option>
                <option value="PROCESSING">Paga</option>
                <option value="SUCCEEDED">Concluída</option>
                <option value="FAILED">Liberada</option>
                <option value="REFUNDED">Reembolsado</option>
                <option value="all">Todos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-accent-foreground mb-2">
                Modalidade
              </label>
              <select
                value={filterModality}
                onChange={(e) => handleFilterChange('modality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="ONLINE">Online</option>
                <option value="IN_PERSON">Presencial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-3">
          {filteredSessions.map((session) => {
            return (
              <SessionHistoryItem
                key={session.id || session.userDetails.name}
                session={session}
                isExpanded={expandedSession === session.id}
                onToggleExpand={() =>
                  setExpandedSession(
                    expandedSession === session.id ? null : session.id,
                  )
                }
              />
            )
          })}
        </div>

        {sessions.length === 0 || filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma sessão encontrada</p>
          </div>
        ) : null}
        <div className="flex items-end justify-end gap-2 mt-6">
          <Button
            variant={'outline'}
            onClick={handleJumpToFirstPage}
            disabled={
              currentPage === 1 ||
              sessions.length === 0 ||
              filteredSessions.length === 0
            }
          >
            <ChevronFirst />
          </Button>
          <Button
            variant={'outline'}
            onClick={handleBackwardPage}
            disabled={
              currentPage === 1 ||
              sessions.length === 0 ||
              filteredSessions.length === 0
            }
          >
            <ChevronLeft />
          </Button>
          <Button
            variant={'outline'}
            onClick={handleFowardPage}
            disabled={
              currentPage === totalPages ||
              sessions.length === 0 ||
              filteredSessions.length === 0
            }
          >
            <ChevronRight />
          </Button>
          <Button
            variant={'outline'}
            onClick={handleJumpToLastPage}
            disabled={
              currentPage === totalPages ||
              sessions.length === 0 ||
              filteredSessions.length === 0
            }
          >
            <ChevronLast />
          </Button>
        </div>
      </div>
    </div>
  )
}
