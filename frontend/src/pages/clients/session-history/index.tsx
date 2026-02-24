import {
  appointmentsServices,
  type FetchScheduleByProfessionalIdFilters,
} from '@/api/endpoints/appointments'
import type { FetchProfessionalSchedulesResponse } from '@/api/endpoints/appointments/dto'
import { PaginationButtons } from '@/components/pagination-buttons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { Search } from 'lucide-react'
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
        <div className="bg-foreground/1 rounded-lg border border-foreground/5 p-6 mb-6">
          <div className="flex gap-4 items-center mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por paciente"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <Label className="block text-sm font-medium text-accent-foreground mb-2">
                Período
              </Label>
              <Select
                value={filterPeriod}
                onValueChange={(value) => handleFilterChange('period', value)}
              >
                <SelectTrigger className="w-full bg-white dark:bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo período</SelectItem>
                  <SelectItem value="last-week">Última semana</SelectItem>
                  <SelectItem value="last-month">Último mês</SelectItem>
                  <SelectItem value="last-year">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium text-accent-foreground mb-2">
                Status da Sessão
              </Label>
              <Select
                value={filterStatus}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-full bg-white dark:bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="SCHEDULED">Agendada</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                  <SelectItem value="RESCHEDULED">Remarcada</SelectItem>
                  <SelectItem value="NO_SHOW">No-show</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                  <SelectItem value="COMPLETED">Realizada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium text-accent-foreground mb-2">
                Status de Pagamento
              </Label>
              <Select
                value={filterPayment}
                onValueChange={(value) =>
                  handleFilterChange('paymentStatus', value)
                }
              >
                <SelectTrigger className="w-full bg-white dark:bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="PROCESSING">Paga</SelectItem>
                  <SelectItem value="SUCCEEDED">Concluída</SelectItem>
                  <SelectItem value="FAILED">Liberada</SelectItem>
                  <SelectItem value="REFUNDED">Reembolsado</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium text-accent-foreground mb-2">
                Modalidade
              </Label>
              <Select
                value={filterModality}
                onValueChange={(value) => handleFilterChange('modality', value)}
              >
                <SelectTrigger className="w-full bg-white dark:bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="IN_PERSON">Presencial</SelectItem>
                </SelectContent>
              </Select>
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
