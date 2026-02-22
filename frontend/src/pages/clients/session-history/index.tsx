import { appointmentsServices } from '@/api/endpoints/appointments'
import type { AddressSchema } from '@/api/schemas/address-schema'
import type { Appointment } from '@/api/schemas/fetch-professional-schedules.dto'
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

      const { appointments } = await fetchAppointmentsByProfessional(
        user?.professional_id,
      )
      console.log(appointments)

      setSessions(appointments)
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  const [searchTerm, setSearchTerm] = useState('')

  const [filterStatus, setFilterStatus] = useState<FilterStatusProps>('all')
  const [filterPayment, setFilterPayment] =
    useState<FilterPaymentStatusProps>('all')
  const [filterModality, setFilterModality] =
    useState<FilterModalityProps>('all')
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriodProps>('all')

  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  const getAppointments = (session: AppointmentsSesions) => {
    const a = session
    if (Array.isArray(a)) return a
    if (a) return [a]
    return []
  }

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.userDetails.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getAppointments(session).some((appointment) =>
        appointment?.id?.toLowerCase().includes(searchTerm.toLowerCase()),
      )

    const matchesStatus =
      filterStatus === 'all' ||
      getAppointments(session).some(
        (appointment) => appointment?.status === filterStatus,
      )
    const matchesPayment =
      filterPayment === 'all' ||
      getAppointments(session).some(
        (appointment) => appointment?.paymentStatus === filterPayment,
      )
    const matchesModality =
      filterModality === 'all' ||
      getAppointments(session).some(
        (appointment) => appointment?.modality === filterModality,
      )
    // Period filter
    let matchesPeriod = true
    if (filterPeriod !== 'all') {
      const firstAppointment = getAppointments(session)[0]
      const sessionDate = firstAppointment
        ? new Date(firstAppointment.startDateTime)
        : null
      const now = new Date()
      const diffTime = sessionDate ? now.getTime() - sessionDate.getTime() : 0
      const diffDays = diffTime / (1000 * 3600 * 24)

      if (filterPeriod === 'week' && diffDays > 7) matchesPeriod = false
      if (filterPeriod === 'month' && diffDays > 30) matchesPeriod = false
      if (filterPeriod === 'year' && diffDays > 365) matchesPeriod = false
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPayment &&
      matchesModality &&
      matchesPeriod
    )
  })

  // Group sessions by patient
  const totalSessions = filteredSessions.length

  const realizadas = filteredSessions.filter((s) =>
    getAppointments(s).some(
      (appointment) => appointment?.status === 'COMPLETED',
    ),
  ).length

  const canceladas = filteredSessions.filter((s) =>
    getAppointments(s).some(
      (appointment) => appointment?.status === 'CANCELLED',
    ),
  ).length

  const noShows = filteredSessions.filter((s) =>
    getAppointments(s).some((appointment) => appointment?.status === 'NO_SHOW'),
  ).length

  const pagamentosPendentes = filteredSessions.filter((s) =>
    getAppointments(s).some(
      (appointment) => appointment?.paymentStatus === 'PENDING',
    ),
  ).length

  const stats = {
    total: totalSessions,
    registered: realizadas,
    unregistered: totalSessions - realizadas,
    online: filteredSessions.filter((s) =>
      getAppointments(s).some(
        (appointment) => appointment?.modality === 'ONLINE',
      ),
    ).length,
  }

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
              {totalSessions}
            </p>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Realizadas</p>
            <p className="text-2xl font-semibold text-accent-foreground">
              {realizadas}
            </p>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Canceladas</p>
            <p className="text-2xl font-semibold text-accent-foreground">
              {canceladas}
            </p>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">No-shows</p>
            <p className="text-2xl font-semibold text-accent-foreground">
              {noShows}
            </p>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-semibold text-accent-foreground">
              {pagamentosPendentes}
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
                placeholder="Buscar por paciente ou data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                onChange={(e) => setFilterPeriod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todo período</option>
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
                <option value="year">Último ano</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-accent-foreground mb-2">
                Status da Sessão
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="realizada">Realizada</option>
                <option value="cancelada">Cancelada</option>
                <option value="remarcada">Remarcada</option>
                <option value="no-show">No-show</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-accent-foreground mb-2">
                Status de Pagamento
              </label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="paga">Paga</option>
                <option value="pendente">Pendente</option>
                <option value="liberada">Liberada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-accent-foreground mb-2">
                Modalidade
              </label>
              <select
                value={filterModality}
                onChange={(e) => setFilterModality(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="online">Online</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-3">
          {/* {filteredSessions.map((session) => {
            const appointment = getAppointments(session)[0]
            if (!appointment) return null
            // Map appointment to Session type
            const mappedSession = {
              name: session.name,
              date: appointment.startDateTime
                ? new Date(appointment.startDateTime).toLocaleDateString()
                : '',
              startTime: appointment.startDateTime
                ? new Date(appointment.startDateTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '',
              endTime: appointment.endDateTime
                ? new Date(appointment.endDateTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '',
              modality: appointment.modality,
              status: appointment.status,
              paymentStatus: appointment.paymentStatus,
              address: session.address,
              value: 0,
              confirmationSent: false,
              remindersSent: {
                d1: false,
                t2h: false,
                t30min: false,
              },
            }
            return (
              <SessionHistoryItem
                key={appointment.id}
                session={mappedSession}
                isExpanded={expandedSession === appointment.id}
                onToggleExpand={() =>
                  setExpandedSession(
                    expandedSession === appointment.id ? null : appointment.id,
                  )
                }
              />
            )
          })} */}
        </div>

        {sessions.map((session) => {
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

        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma sessão encontrada</p>
          </div>
        )}
      </div>
    </div>
  )
}
