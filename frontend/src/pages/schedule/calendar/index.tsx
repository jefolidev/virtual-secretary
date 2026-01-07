import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  AlertTriangle,
  Calendar,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Filter,
  MapPin,
  Monitor,
  RefreshCw,
  RotateCcw,
  Stethoscope,
  Users,
  UserX,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

// Tipos
interface Appointment {
  id: string
  patientName: string
  time: string
  endTime?: string
  date: string
  type: 'consulta' | 'retorno'
  modalidade: 'presencial' | 'remota'
  status:
    | 'agendado'
    | 'confirmado'
    | 'cancelado'
    | 'finalizado'
    | 'nao-pago'
    | 'pago'
    | 'no-show'
    | 'remarcado'
  duration?: number // em minutos
}

type ViewMode = 'day' | 'week' | 'month'

// Dados mock
const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientName: 'Maria Silva',
    time: '09:00',
    endTime: '11:00',
    date: '2026-01-06',
    type: 'consulta',
    modalidade: 'presencial',
    status: 'pago',
    duration: 120,
  },
  {
    id: '2',
    patientName: 'João Santos',
    time: '11:00',
    endTime: '12:30',
    date: '2026-01-06',
    type: 'retorno',
    modalidade: 'remota',
    status: 'finalizado',
    duration: 90,
  },
  {
    id: '3',
    patientName: 'Pedro Costa',
    time: '13:00',
    endTime: '14:30',
    date: '2026-01-06',
    type: 'consulta',
    modalidade: 'presencial',
    status: 'cancelado',
    duration: 90,
  },
  {
    id: '4',
    patientName: 'Ana Costa',
    time: '14:00',
    endTime: '15:30',
    date: '2026-01-07',
    type: 'consulta',
    modalidade: 'remota',
    status: 'nao-pago',
    duration: 90,
  },
  {
    id: '5',
    patientName: 'Carlos Oliveira',
    time: '15:30',
    endTime: '16:30',
    date: '2026-01-08',
    type: 'consulta',
    modalidade: 'presencial',
    status: 'no-show',
    duration: 60,
  },
  {
    id: '6',
    patientName: 'Lucia Ferreira',
    time: '11:00',
    endTime: '12:00',
    date: '2026-01-10',
    type: 'retorno',
    modalidade: 'remota',
    status: 'remarcado',
    duration: 60,
  },
  {
    id: '7',
    patientName: 'Roberto Alves',
    time: '08:00',
    endTime: '09:00',
    date: '2026-01-06',
    type: 'consulta',
    modalidade: 'presencial',
    status: 'agendado',
    duration: 60,
  },
  {
    id: '8',
    patientName: 'Fernanda Lima',
    time: '15:00',
    endTime: '16:00',
    date: '2026-01-06',
    type: 'retorno',
    modalidade: 'remota',
    status: 'confirmado',
    duration: 60,
  },
  {
    id: '9',
    patientName: 'Marcos Silva',
    time: '13:00',
    endTime: '14:00',
    date: '2026-01-06',
    type: 'consulta',
    modalidade: 'remota',
    status: 'confirmado',
    duration: 60,
  },
]

// Utilitários de data
const formatDate = (date: Date, format: 'full' | 'month' | 'day' = 'full') => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  if (format === 'month') {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'long',
    }).format(date)
  }

  if (format === 'day') {
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
    }).format(date)
  }

  return new Intl.DateTimeFormat('pt-BR', options).format(date)
}

const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

const getWeekDays = (startDate: Date) => {
  const days = []
  const start = new Date(startDate)
  start.setDate(start.getDate() - start.getDay())

  for (let i = 0; i < 7; i++) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    days.push(day)
  }
  return days
}

const getMonthDays = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  const current = new Date(startDate)

  while (current <= lastDay || days.length < 42) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return days
}

// Utilitários para horários
const HOUR_HEIGHT = 110 // altura em pixels por hora

const generateTimeSlots = (startHour = 8, endHour = 18) => {
  const slots = []
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
  }
  return slots
}

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const getAppointmentPosition = (appointment: Appointment, startHour = 8) => {
  const startMinutes = timeToMinutes(appointment.time)
  const endMinutes = appointment.endTime
    ? timeToMinutes(appointment.endTime)
    : startMinutes + (appointment.duration || 60)
  const gridStartMinutes = startHour * 60

  const top = ((startMinutes - gridStartMinutes) / 60) * HOUR_HEIGHT
  const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT

  return { top, height }
}

// Função para obter cores dos status
const getStatusStyles = (status: Appointment['status']) => {
  switch (status) {
    case 'agendado':
      return {
        bg: 'bg-blue-200 dark:bg-blue-950',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-blue-500',
        iconBg: 'bg-blue-400 dark:bg-blue-800',
        label: getStatusLabel(status),
      }
    case 'confirmado':
      return {
        bg: 'bg-green-200 dark:bg-green-950',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-green-500',
        iconBg: 'bg-green-400 dark:bg-green-800',
        label: getStatusLabel(status),
      }
    case 'cancelado':
      return {
        bg: 'bg-red-200 dark:bg-red-950',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-red-500',
        iconBg: 'bg-red-400 dark:bg-red-800',
        label: getStatusLabel(status),
      }
    case 'finalizado':
      return {
        bg: 'bg-emerald-200 dark:bg-emerald-950',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-emerald-500',
        iconBg: 'bg-emerald-400 dark:bg-emerald-800',
        label: getStatusLabel(status),
      }
    case 'nao-pago':
      return {
        bg: 'bg-orange-200 dark:bg-orange-950',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-orange-500',
        iconBg: 'bg-orange-400 dark:bg-orange-800',
        label: getStatusLabel(status),
      }
    case 'pago':
      return {
        bg: 'bg-teal-200 dark:bg-teal-950',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-teal-500',
        iconBg: 'bg-teal-400 dark:bg-teal-800',
        label: getStatusLabel(status),
      }
    case 'no-show':
      return {
        bg: 'bg-purple-200 dark:bg-purple-950',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-purple-500',
        iconBg: 'bg-purple-400 dark:bg-purple-800',
        label: getStatusLabel(status),
      }
    case 'remarcado':
      return {
        bg: 'bg-yellow-200 dark:bg-yellow-950',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-yellow-500',
        iconBg: 'bg-yellow-400 dark:bg-yellow-800',
        label: getStatusLabel(status),
      }
    default:
      return {
        bg: 'bg-gray-200 dark:bg-gray-950',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-gray-500',
        iconBg: 'bg-gray-400 dark:bg-gray-800',
        label: getStatusLabel(status),
      }
  }
}

// Função auxiliar para obter labels
const getStatusLabel = (status: Appointment['status']) => {
  const labels = {
    agendado: 'Agendado',
    confirmado: 'Confirmado',
    cancelado: 'Cancelado',
    finalizado: 'Finalizado',
    'nao-pago': 'Não Pago',
    pago: 'Pago',
    'no-show': 'No-Show',
    remarcado: 'Remarcado',
  }
  return labels[status]
}

// Função para obter ícones dos status
const getStatusIcon = (status: Appointment['status']) => {
  const iconMap = {
    agendado: Calendar,
    confirmado: CheckCircle,
    cancelado: XCircle,
    finalizado: CheckCircle,
    'nao-pago': AlertTriangle,
    pago: DollarSign,
    'no-show': UserX,
    remarcado: RotateCcw,
  }
  return iconMap[status]
}

// Componente da Grade de Horários
interface DayScheduleGridProps {
  date: Date
  appointments: Appointment[]
}

function DayScheduleGrid({ date, appointments }: DayScheduleGridProps) {
  const [mouseIndicator, setMouseIndicator] = useState<{
    visible: boolean
    y: number
    time: string
  }>({ visible: false, y: 0, time: '' })

  const timeSlots = generateTimeSlots(8, 18)
  const dayAppointments = appointments.filter(
    (apt) => apt.date === date.toISOString().split('T')[0]
  )

  // Função para calcular horário baseado na posição Y do mouse
  const calculateTimeFromY = (y: number) => {
    const minutesFromTop = (y / HOUR_HEIGHT) * 60
    const totalMinutes = 8 * 60 + minutesFromTop // Começa às 8:00
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.floor(totalMinutes % 60)
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`
  }

  // Handlers de mouse
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const time = calculateTimeFromY(y)
    setMouseIndicator({ visible: true, y, time })
  }

  const handleMouseLeave = () => {
    setMouseIndicator({ visible: false, y: 0, time: '' })
  }

  return (
    <div className="flex">
      {/* Coluna de horários */}
      <div className="w-20 border-r">
        <div className="h-12"></div> {/* Espaço para header */}
        {timeSlots.map((time) => (
          <div
            key={time}
            className="border-b border-gray-300 dark:border-gray-50/10 flex items-start pt-2 pr-2"
            style={{ height: `${HOUR_HEIGHT}px` }}
          >
            <span className="text-sm text-muted-foreground font-medium">
              {time}
            </span>
          </div>
        ))}
      </div>

      {/* Área de agendamentos */}
      <div className="flex-1 relative">
        {/* Header */}
        <div className="h-12 border-b border-gray-300 dark:border-gray-50/10 flex items-center px-4">
          <span className="font-medium">
            {new Intl.DateTimeFormat('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(date)}
          </span>
        </div>

        {/* Linhas de horário */}
        <div
          className="relative"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {timeSlots.map((time) => (
            <div
              key={time}
              className="border-b border-gray-300 dark:border-gray-50/10 hover:bg-gray-50/20 transition-colors "
              style={{ height: `${HOUR_HEIGHT}px`, zIndex: -1 }}
            ></div>
          ))}

          {/* Indicador de linha do mouse */}
          {mouseIndicator.visible && (
            <div
              className="absolute left-0 right-0 z-30 pointer-events-none"
              style={{ top: `${mouseIndicator.y}px` }}
            >
              {/* Bolinha */}
              <div
                className="absolute w-2 h-2 bg-red-400 rounded-full"
                style={{ left: '0px', top: '-1px' }}
              ></div>
              {/* Linha */}
              <div
                className="absolute h-0.5 bg-red-400 rounded-sm"
                style={{ left: '9px', right: '0px', top: '1px' }}
              ></div>
              {/* Legenda com horário */}
              <div
                className="absolute bg-red-400 text-white px-2 py-1 rounded text-xs font-medium transform -translate-y-1/2"
                style={{
                  left: '50%',
                  transform: 'translateX(-50%) translateY(-50%)',
                }}
              >
                {mouseIndicator.time}
              </div>
            </div>
          )}

          {/* Agendamentos */}
          {dayAppointments.map((appointment, index) => {
            const { top } = getAppointmentPosition(appointment, 8)
            const styles = getStatusStyles(appointment.status)
            const StatusIcon = getStatusIcon(appointment.status)

            // Verificar se existe outro agendamento no mesmo horário
            const sameTimeAppointments = dayAppointments.filter(
              (apt) => apt.time === appointment.time
            )
            let columnPosition = 0

            if (sameTimeAppointments.length > 1) {
              // Se há múltiplos agendamentos no mesmo horário, verificar ordem
              const currentIndex = sameTimeAppointments.findIndex(
                (apt) => apt.id === appointment.id
              )

              // Se o primeiro agendamento é cancelado/remarcado/no-show, permitir segundo na mesma linha
              const firstAppointment = sameTimeAppointments[0]
              const canHaveSecond = [
                'cancelado',
                'remarcado',
                'no-show',
              ].includes(firstAppointment.status)

              if (canHaveSecond && currentIndex === 1) {
                columnPosition = 1 // Posicionar ao lado
              }
            }

            // Largura e altura fixa para encaixar na grade
            const cardWidth = columnPosition === 1 ? 280 : 300 // Largura menor para o segundo card
            const verticalPadding = 6 // Padding para não grudar na grade
            const cardHeight = HOUR_HEIGHT - verticalPadding * 2 // Altura fixa com padding
            const leftPosition = columnPosition === 0 ? 12 : 320 // Posição do segundo card ao lado

            return (
              <div
                key={appointment.id}
                className={`absolute  rounded-lg p-3 shadow-md cursor-pointer min-w-xs hover:shadow-lg transition-all duration-200 overflow-hidden ${styles.bg} ${styles.text}`}
                style={{
                  top: `${top + verticalPadding}px`,
                  height: `${cardHeight}px`,
                  left: `${leftPosition}px`,
                  width: `${cardWidth}px`,
                  zIndex: 20,
                }}
              >
                {/* Nome do paciente com ícone à esquerda e status à direita */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {/* Ícone em quadradinho */}
                    <div
                      className={`w-6 h-6 rounded ${styles.iconBg} flex items-center justify-center`}
                    >
                      <StatusIcon className="h-4 w-4 text-white" />
                    </div>
                    {/* Nome do paciente */}
                    <div className="font-semibold text-sm leading-tight truncate">
                      {appointment.patientName}
                    </div>
                  </div>
                  {/* Status no canto direito */}
                  <div className="dark:bg-card bg-white text-zinc-950 dark:text-white px-2 py-1 rounded-sm flex items-center gap-1 shrink-0">
                    <div
                      className={`w-3 h-3 rounded-full ${styles.dotColor}`}
                    ></div>
                    <span className="text-xs font-medium opacity-75 truncate">
                      {styles.label}
                    </span>
                  </div>
                </div>

                {/* Horário */}
                <div className="flex gap-2 ml-8">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    {appointment.time} — {appointment.endTime}
                  </span>
                </div>

                {/* Footer com tipo e modalidade */}
                <div className="mt-3 pt-1 border-t border-gray-300/30 dark:border-gray-600/30">
                  <div className="flex items-center gap-2 mt-1">
                    <div className="dark:bg-card bg-white text-zinc-950 dark:text-white px-2 py-1 rounded-sm flex items-center gap-1 shrink-0">
                      {appointment.type === 'consulta' ? (
                        <Stethoscope className="h-3 w-3" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      <span className="text-xs font-medium opacity-75 capitalize">
                        {appointment.type}
                      </span>
                    </div>
                    <div className="dark:bg-card bg-white text-zinc-950 dark:text-white px-2 py-1 rounded-sm flex items-center gap-1 shrink-0">
                      {appointment.modalidade === 'presencial' ? (
                        <MapPin className="h-3 w-3" />
                      ) : (
                        <Monitor className="h-3 w-3" />
                      )}
                      <span className="text-xs font-medium opacity-75">
                        {appointment.modalidade === 'presencial'
                          ? 'Presencial'
                          : 'Remota'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Componente do card de dia
interface DayCardProps {
  date: Date
  appointments: Appointment[]
  viewMode: ViewMode
  isCurrentMonth?: boolean
}

function DayCard({
  date,
  appointments,
  viewMode,
  isCurrentMonth = true,
}: DayCardProps) {
  const today = new Date()
  const isToday = isSameDay(date, today)
  const isPastDate = date < today && !isToday

  const dayAppointments = appointments.filter(
    (apt) => apt.date === date.toISOString().split('T')[0]
  )

  const getCardSize = () => {
    switch (viewMode) {
      case 'day':
        return 'min-h-[400px] w-full'
      case 'week':
        return 'min-h-[200px] w-full'
      case 'month':
        return 'min-h-[120px] w-full aspect-square'
      default:
        return 'h-20'
    }
  }

  return (
    <Card
      className={`
        ${getCardSize()}
        cursor-pointer hover:shadow-md transition-shadow
        ${isToday ? 'ring-2 ring-primary' : ''}
        ${isPastDate ? 'opacity-60' : ''}
        ${!isCurrentMonth ? 'opacity-40' : ''}
        ${dayAppointments.length > 0 ? 'border-primary/20 bg-primary/5' : ''}
      `}
    >
      <CardContent
        className={`p-3 h-full flex flex-col overflow-hidden ${
          viewMode === 'month' ? 'p-2' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-2 shrink-0">
          <span
            className={`
              ${viewMode === 'month' ? 'text-sm' : 'text-base'} font-medium
              ${isToday ? 'text-primary font-bold' : ''}
              ${isPastDate ? 'text-muted-foreground' : ''}
            `}
          >
            {formatDate(date, 'day')}
          </span>
          {dayAppointments.length > 0 && (
            <span className="text-xs text-muted-foreground bg-primary/10 px-1 rounded">
              {dayAppointments.length}
            </span>
          )}
        </div>

        {dayAppointments.length > 0 ? (
          <div className="flex-1 overflow-hidden">
            <div
              className={`space-y-1 ${
                viewMode === 'day' || viewMode === 'week'
                  ? 'max-h-full overflow-y-auto'
                  : ''
              }`}
            >
              {dayAppointments
                .slice(0, viewMode === 'month' ? 3 : dayAppointments.length)
                .map((apt) => {
                  const styles = getStatusStyles(apt.status)
                  return (
                    <div
                      key={apt.id}
                      className={`
                      ${
                        viewMode === 'month' ? 'p-1 text-xs' : 'p-2 text-sm'
                      } rounded border-l-2 overflow-hidden
                      ${styles.bg}  ${styles.text}
                    `}
                    >
                      <div className="font-medium truncate">
                        {apt.patientName}
                      </div>
                      <div
                        className={`opacity-75 flex items-center gap-1 ${
                          viewMode === 'month' ? 'text-xs' : 'text-sm'
                        }`}
                      >
                        <Clock
                          className={`${
                            viewMode === 'month' ? 'h-3 w-3' : 'h-4 w-4'
                          }`}
                        />
                        {apt.time}
                      </div>

                      {(viewMode === 'day' || viewMode === 'week') && (
                        <div className="text-xs opacity-75 mt-1">
                          {styles.label}
                        </div>
                      )}
                    </div>
                  )
                })}
              {viewMode === 'month' && dayAppointments.length > 3 && (
                <div className="text-xs text-muted-foreground text-center bg-muted/50 rounded p-1">
                  +{dayAppointments.length - 3} mais
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span
              className={`text-muted-foreground ${
                viewMode === 'month' ? 'text-xs' : 'text-sm'
              }`}
            >
              Sem agendamentos
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente principal
export function ScheduleCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [selectedPatient, setSelectedPatient] = useState('all')
  const [filters, setFilters] = useState({
    showAgendado: true,
    showConfirmado: true,
    showPago: true,
    showFinalizado: true,
    showNaoPago: true,
    showNoShow: false,
    showRemarcado: true,
    showCancelado: true, // Ativando para mostrar os cancelados
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

  // Formatar data para exibição
  const getDateDisplay = () => {
    if (viewMode === 'week') {
      const weekDays = getWeekDays(currentDate)
      return `${formatDate(weekDays[0], 'day')} - ${formatDate(
        weekDays[6],
        'day'
      )} ${new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
      }).format(currentDate)}`
    }

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }

    return new Intl.DateTimeFormat('pt-BR', options).format(currentDate)
  }

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
          <div className="space-y-4">
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
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
              {weekDays.map((date, index) => (
                <DayCard
                  key={index}
                  date={date}
                  appointments={filteredAppointments}
                  viewMode="week"
                />
              ))}
            </div>
          </div>
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
    <div className="space-y-4">
      {/* Cabeçalho com contador */}
      <div className="flex items-center gap-3">
        <CalendarIcon className="h-5 w-5 text-primary" />
        <span className="text-2xl font-bold">
          {filteredAppointments.length}
        </span>
        <span className="text-muted-foreground">agendamentos totais</span>
      </div>

      {/* Barra de ferramentas */}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Navegação de data */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday}>
            Hoje
          </Button>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="min-w-50 text-center px-4">
              <span className="font-medium">{getDateDisplay()}</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Controles direita */}
        <div className="flex items-center gap-2 flex-wrap p-2">
          {/* Botões de visualização */}
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className="rounded-r-none"
            >
              Dia
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="rounded-none"
            >
              Semana
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="rounded-l-none"
            >
              Mês
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Select de pacientes */}
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-45">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <SelectValue placeholder="Todos os Pacientes" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Pacientes</SelectItem>
              {uniquePatients.map((patient) => (
                <SelectItem key={patient} value={patient}>
                  {patient}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtros */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 max-h-80 overflow-y-auto"
            >
              <DropdownMenuLabel>Status dos Agendamentos</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filters.showAgendado}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    showAgendado: checked ?? false,
                  }))
                }
              >
                Agendado
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.showConfirmado}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    showConfirmado: checked ?? false,
                  }))
                }
              >
                Confirmado
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.showPago}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    showPago: checked ?? false,
                  }))
                }
              >
                Pago
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.showFinalizado}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    showFinalizado: checked ?? false,
                  }))
                }
              >
                Finalizado
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.showNaoPago}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    showNaoPago: checked ?? false,
                  }))
                }
              >
                Não Pago
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.showNoShow}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    showNoShow: checked ?? false,
                  }))
                }
              >
                No-Show
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.showRemarcado}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    showRemarcado: checked ?? false,
                  }))
                }
              >
                Remarcado
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.showCancelado}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    showCancelado: checked ?? false,
                  }))
                }
              >
                Cancelado
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Calendário */}
      <Card>
        <CardContent className="px-6 py-1">{renderCalendar()}</CardContent>
      </Card>
    </div>
  )
}
