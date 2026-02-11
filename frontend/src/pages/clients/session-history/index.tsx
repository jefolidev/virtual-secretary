import { Search } from 'lucide-react'
import { useState } from 'react'
import {
  SessionHistoryItem,
  type Session,
} from './components/session-history-item'

const mockSessions: Session[] = [
  // Ana Carolina Silva - 5 sessões
  {
    id: '1',
    patientName: 'Ana Carolina Silva',
    patientImage:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    date: '2024-02-11',
    startTime: '14:00',
    endTime: '14:50',
    modality: 'online',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'pix',
    value: 200.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 10,
    feedback: 'Excelente atendimento! Me senti muito acolhida.',
  },
  {
    id: '2',
    patientName: 'Ana Carolina Silva',
    patientImage:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    date: '2024-02-04',
    startTime: '14:00',
    endTime: '14:50',
    modality: 'online',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'pix',
    value: 200.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 9,
  },
  {
    id: '3',
    patientName: 'Ana Carolina Silva',
    patientImage:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    date: '2024-01-28',
    startTime: '14:00',
    endTime: '14:50',
    modality: 'presencial',
    address: 'Rua das Flores, 123 - Sala 45',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'cartao',
    value: 200.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 10,
  },
  {
    id: '4',
    patientName: 'Ana Carolina Silva',
    patientImage:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    date: '2024-01-21',
    startTime: '14:00',
    endTime: '14:50',
    modality: 'online',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'pix',
    value: 180.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 9,
  },
  {
    id: '5',
    patientName: 'Ana Carolina Silva',
    patientImage:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    date: '2024-01-14',
    startTime: '14:00',
    endTime: '14:50',
    modality: 'online',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'pix',
    value: 180.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 8,
  },

  // Carlos Eduardo - 4 sessões
  {
    id: '6',
    patientName: 'Carlos Eduardo',
    patientImage:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    date: '2024-02-10',
    startTime: '10:00',
    endTime: '10:50',
    modality: 'presencial',
    address: 'Rua das Flores, 123 - Sala 45',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'cartao',
    value: 200.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 9,
    feedback: 'Muito bom, estou evoluindo bastante.',
  },
  {
    id: '7',
    patientName: 'Carlos Eduardo',
    patientImage:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    date: '2024-01-27',
    startTime: '10:00',
    endTime: '10:50',
    modality: 'presencial',
    address: 'Rua das Flores, 123 - Sala 45',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'cartao',
    value: 200.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 8,
  },
  {
    id: '8',
    patientName: 'Carlos Eduardo',
    patientImage:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    date: '2024-01-13',
    startTime: '10:00',
    endTime: '10:50',
    modality: 'presencial',
    address: 'Rua das Flores, 123 - Sala 45',
    status: 'cancelada',
    paymentStatus: 'liberada',
    value: 200.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: false, t30min: false },
  },
  {
    id: '9',
    patientName: 'Carlos Eduardo',
    patientImage:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    date: '2023-12-16',
    startTime: '10:00',
    endTime: '10:50',
    modality: 'online',
    meetingLink: 'https://meet.google.com/xyz-abc-123',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'pix',
    value: 180.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 9,
  },

  // Maria (WhatsApp) - 3 sessões
  {
    id: '10',
    patientName: 'Maria (WhatsApp)',
    patientImage:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    date: '2024-02-09',
    startTime: '16:00',
    endTime: '16:50',
    modality: 'online',
    meetingLink: 'https://meet.google.com/xyz-uvw-rst',
    status: 'no-show',
    paymentStatus: 'liberada',
    value: 200.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
  },
  {
    id: '11',
    patientName: 'Maria (WhatsApp)',
    patientImage:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    date: '2024-01-26',
    startTime: '16:00',
    endTime: '16:50',
    modality: 'online',
    meetingLink: 'https://meet.google.com/xyz-uvw-rst',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'pix',
    value: 200.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 7,
  },
  {
    id: '12',
    patientName: 'Maria (WhatsApp)',
    patientImage:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    date: '2024-01-12',
    startTime: '16:00',
    endTime: '16:50',
    modality: 'online',
    meetingLink: 'https://meet.google.com/xyz-uvw-rst',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'pix',
    value: 200.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 8,
  },

  // João Pedro Santos - 5 sessões
  {
    id: '13',
    patientName: 'João Pedro Santos',
    patientImage:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    date: '2024-02-08',
    startTime: '11:00',
    endTime: '11:50',
    modality: 'presencial',
    address: 'Rua das Flores, 123 - Sala 45',
    status: 'realizada',
    paymentStatus: 'pendente',
    value: 200.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: false, t30min: false },
    npsScore: 8,
  },
  {
    id: '14',
    patientName: 'João Pedro Santos',
    patientImage:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    date: '2024-01-25',
    startTime: '11:00',
    endTime: '11:50',
    modality: 'presencial',
    address: 'Rua das Flores, 123 - Sala 45',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'cartao',
    value: 200.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 9,
  },
  {
    id: '15',
    patientName: 'João Pedro Santos',
    patientImage:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    date: '2024-01-11',
    startTime: '11:00',
    endTime: '11:50',
    modality: 'online',
    meetingLink: 'https://meet.google.com/qwe-rty-uio',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'pix',
    value: 200.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 7,
  },
  {
    id: '16',
    patientName: 'João Pedro Santos',
    patientImage:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    date: '2023-12-28',
    startTime: '11:00',
    endTime: '11:50',
    modality: 'presencial',
    address: 'Rua das Flores, 123 - Sala 45',
    status: 'remarcada',
    paymentStatus: 'pendente',
    value: 180.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: false, t30min: false },
  },
  {
    id: '17',
    patientName: 'João Pedro Santos',
    patientImage:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    date: '2023-12-14',
    startTime: '11:00',
    endTime: '11:50',
    modality: 'online',
    meetingLink: 'https://meet.google.com/qwe-rty-uio',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'pix',
    value: 180.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 8,
  },

  // Juliana Oliveira - 4 sessões
  {
    id: '18',
    patientName: 'Juliana Oliveira',
    patientImage:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    date: '2024-02-07',
    startTime: '15:00',
    endTime: '15:50',
    modality: 'online',
    meetingLink: 'https://meet.google.com/klm-nop-qrs',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'pix',
    value: 200.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 10,
    feedback: 'Sessão transformadora!',
  },
  {
    id: '19',
    patientName: 'Juliana Oliveira',
    patientImage:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    date: '2024-01-24',
    startTime: '15:00',
    endTime: '15:50',
    modality: 'online',
    meetingLink: 'https://meet.google.com/klm-nop-qrs',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'pix',
    value: 200.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 9,
  },
  {
    id: '20',
    patientName: 'Juliana Oliveira',
    patientImage:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    date: '2024-01-10',
    startTime: '15:00',
    endTime: '15:50',
    modality: 'presencial',
    address: 'Rua das Flores, 123 - Sala 45',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'cartao',
    value: 200.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 10,
  },
  {
    id: '21',
    patientName: 'Juliana Oliveira',
    patientImage:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    date: '2023-12-20',
    startTime: '15:00',
    endTime: '15:50',
    modality: 'online',
    meetingLink: 'https://meet.google.com/klm-nop-qrs',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'pix',
    value: 180.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 9,
  },

  // Roberto (WhatsApp) - 2 sessões
  {
    id: '22',
    patientName: 'Roberto (WhatsApp)',
    patientImage:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    date: '2024-02-06',
    startTime: '09:00',
    endTime: '09:50',
    modality: 'presencial',
    address: 'Rua das Flores, 123 - Sala 45',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'pix',
    value: 200.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 8,
  },
  {
    id: '23',
    patientName: 'Roberto (WhatsApp)',
    patientImage:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    date: '2024-01-23',
    startTime: '09:00',
    endTime: '09:50',
    modality: 'presencial',
    address: 'Rua das Flores, 123 - Sala 45',
    status: 'realizada',
    paymentStatus: 'paga',
    paymentMethod: 'cartao',
    value: 200.0,
    confirmationSent: true,
    remindersSent: { d1: true, t2h: true, t30min: true },
    npsScore: 7,
  },
]

export function SessionHistory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'realizada' | 'cancelada' | 'remarcada' | 'no-show'
  >('all')
  const [filterPayment, setFilterPayment] = useState<
    'all' | 'paga' | 'pendente' | 'liberada'
  >('all')
  const [filterModality, setFilterModality] = useState<
    'all' | 'online' | 'presencial'
  >('all')
  const [filterPeriod, setFilterPeriod] = useState<
    'all' | 'week' | 'month' | 'year'
  >('all')
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  const filteredSessions = mockSessions.filter((session) => {
    const matchesSearch =
      session.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.date.includes(searchTerm)

    const matchesStatus =
      filterStatus === 'all' || session.status === filterStatus
    const matchesPayment =
      filterPayment === 'all' || session.paymentStatus === filterPayment
    const matchesModality =
      filterModality === 'all' || session.modality === filterModality

    // Period filter
    let matchesPeriod = true
    if (filterPeriod !== 'all') {
      const sessionDate = new Date(session.date)
      const now = new Date()
      const diffTime = now.getTime() - sessionDate.getTime()
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
  const sessionsByPatient = filteredSessions.reduce(
    (acc, session) => {
      if (!acc[session.patientName]) {
        acc[session.patientName] = []
      }
      acc[session.patientName].push(session)
      return acc
    },
    {} as Record<string, Session[]>,
  )

  const totalSessions = filteredSessions.length
  const totalPatients = Object.keys(sessionsByPatient).length
  const realizadas = filteredSessions.filter(
    (s) => s.status === 'realizada',
  ).length
  const canceladas = filteredSessions.filter(
    (s) => s.status === 'cancelada',
  ).length
  const noShows = filteredSessions.filter((s) => s.status === 'no-show').length
  const pagamentosPendentes = filteredSessions.filter(
    (s) => s.paymentStatus === 'pendente',
  ).length

  const stats = {
    total: totalSessions,
    registered: realizadas,
    unregistered: totalSessions - realizadas,
    online: filteredSessions.filter((s) => s.modality === 'online').length,
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
          {filteredSessions.map((session) => (
            <SessionHistoryItem
              key={session.id}
              session={session}
              isExpanded={expandedSession === session.id}
              onToggleExpand={() =>
                setExpandedSession(
                  expandedSession === session.id ? null : session.id,
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
      </div>
    </div>
  )
}
