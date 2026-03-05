import {
  appointmentsServices,
  type FetchScheduleByProfessionalIdFilters,
} from '@/api/endpoints/appointments'
import type { FetchProfessionalSchedulesResponse } from '@/api/endpoints/appointments/dto'
import { PaginationButtons } from '@/components/pagination-buttons'
import { useAuth } from '@/contexts/auth-context'
import {
  Calendar,
  ChevronDown,
  CreditCard,
  Filter,
  Search,
  Video,
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

export function SessionHistory() {
  const [sessions, setSessions] = useState<
    FetchProfessionalSchedulesResponse[]
  >([])
  const [filters, setFilters] = useState<FetchScheduleByProfessionalIdFilters>({
    modality: 'all',
    paymentStatus: 'all',
    period: 'all',
    status: 'all',
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const handlePageChange = (page: number) => setCurrentPage(page)

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

      const response = await fetchAppointmentsByProfessional(
        user.professional_id,
        currentPage,
        filters,
      )

      setSessions(response.appointments)
      setTotalPages(response.pages)
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [filters, currentPage])

  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  const selectClass =
    'w-full pl-3 pr-8 py-2 text-xs bg-transparent text-foreground border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring transition-colors appearance-none cursor-pointer'

  const handleFilterChange = (
    filterType: 'period' | 'status' | 'paymentStatus' | 'modality',
    value: string,
  ) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }))
  }

  const filterPeriod = filters.period as FilterPeriodProps
  const filterStatus = filters.status as FilterStatusProps
  const filterPayment = filters.paymentStatus as FilterPaymentStatusProps
  const filterModality = filters.modality as FilterModalityProps

  const filteredSessions = sessions.filter((session) => {
    if (!searchTerm) return true
    return session.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="">
      <div className="flex justify-between items-center mb-2 py-6 border-b px-8">
        <div>
          <h1 className="text-2xl font-semibold">Histórico de Sessões</h1>
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
              {sessions.filter((s) => s.appointment.status === 'COMPLETED')
                .length * (totalPages > 1 ? totalPages : 1)}
            </p>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Canceladas</p>
            <p className="text-2xl font-semibold text-accent-foreground">
              {sessions.filter((s) => s.appointment.status === 'CANCELLED')
                .length * (totalPages > 1 ? totalPages : 1)}
            </p>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">No-shows</p>
            <p className="text-2xl font-semibold text-accent-foreground">
              {sessions.filter((s) => s.appointment.status === 'NO_SHOW')
                .length * (totalPages > 1 ? totalPages : 1)}
            </p>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-semibold text-accent-foreground">
              {sessions.filter((s) => s.appointment.paymentStatus === 'PENDING')
                .length * (totalPages > 1 ? totalPages : 1)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-card rounded-2xl border border-border px-6 py-5 space-y-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por paciente ou número de sessão..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-transparent text-foreground placeholder:text-muted-foreground border-b border-border focus:outline-none focus:border-ring transition-colors"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-medium text-muted-foreground mb-1.5">
                <Calendar className="inline w-3 h-3 mr-1 opacity-70" />
                Período
              </label>
              <div className="relative">
                <select
                  value={filterPeriod}
                  onChange={(e) => handleFilterChange('period', e.target.value)}
                  className={selectClass}
                >
                  <option value="all">Todo período</option>
                  <option value="last-week">Última semana</option>
                  <option value="last-month">Último mês</option>
                  <option value="last-year">Último ano</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-medium text-muted-foreground mb-1.5">
                <Filter className="inline w-3 h-3 mr-1 opacity-70" />
                Status da Sessão
              </label>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    handleFilterChange('status', e.target.value)
                    setCurrentPage(1)
                  }}
                  className={selectClass}
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
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-medium text-muted-foreground mb-1.5">
                <CreditCard className="inline w-3 h-3 mr-1 opacity-70" />
                Pagamento
              </label>
              <div className="relative">
                <select
                  value={filterPayment}
                  onChange={(e) => {
                    handleFilterChange('paymentStatus', e.target.value)
                    setCurrentPage(1)
                  }}
                  className={selectClass}
                >
                  <option value="all">Todos</option>
                  <option value="PENDING">Pendente</option>
                  <option value="PROCESSING">Em processo</option>
                  <option value="SUCCEEDED">Pago</option>
                  <option value="FAILED">Liberada</option>
                  <option value="REFUNDED">Reembolsado</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-medium text-muted-foreground mb-1.5">
                <Video className="inline w-3 h-3 mr-1 opacity-70" />
                Modalidade
              </label>
              <div className="relative">
                <select
                  value={filterModality}
                  onChange={(e) => {
                    handleFilterChange('modality', e.target.value)
                    setCurrentPage(1)
                  }}
                  className={selectClass}
                >
                  <option value="all">Todas</option>
                  <option value="ONLINE">Online</option>
                  <option value="IN_PERSON">Presencial</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <SessionHistoryItem
              key={session.appointment.id}
              session={session}
              isExpanded={expandedSession === session.appointment.id}
              onToggleExpand={() =>
                setExpandedSession(
                  expandedSession === session.appointment.id
                    ? null
                    : session.appointment.id,
                )
              }
            />
          ))}
        </div>

        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma sessão encontrada</p>
          </div>
        )}

        {filteredSessions.length > 0 && (
          <PaginationButtons
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            position="end"
          />
        )}
      </div>
    </div>
  )
}
