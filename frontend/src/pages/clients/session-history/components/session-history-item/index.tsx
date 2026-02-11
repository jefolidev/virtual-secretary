import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  MapPin,
  MessageSquare,
  Repeat,
  Star,
  Video,
  XCircle,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export interface Session {
  id: string
  patientName: string
  patientImage: string
  date: string
  startTime: string
  endTime: string
  modality: 'online' | 'presencial'
  meetingLink?: string
  address?: string
  status: 'realizada' | 'cancelada' | 'remarcada' | 'no-show'
  paymentStatus: 'paga' | 'pendente' | 'liberada'
  paymentMethod?: 'pix' | 'cartao'
  value: number
  confirmationSent: boolean
  remindersSent: {
    d1: boolean
    t2h: boolean
    t30min: boolean
  }
  npsScore?: number
  feedback?: string
}

interface SessionHistoryItemProps {
  session: Session
  isExpanded: boolean
  onToggleExpand: () => void
}

const statusConfig = {
  realizada: {
    label: 'Realizada',
    color:
      'bg-green-100 text-green-700 dark:bg-green-700/10 dark:text-green-700',
    icon: CheckCircle,
  },
  cancelada: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-700 dark:bg-red-700/10 dark:text-red-700',
    icon: XCircle,
  },
  remarcada: {
    label: 'Remarcada',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-700/10 dark:text-blue-700',
    icon: Repeat,
  },
  'no-show': {
    label: 'No-show',
    color:
      'bg-orange-100 text-orange-700 dark:bg-orange-700/10 dark:text-orange-700',
    icon: AlertCircle,
  },
}

const paymentStatusConfig = {
  paga: { label: 'Paga', color: 'bg-green-100 text-green-700' },
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
  liberada: { label: 'Liberada', color: 'bg-gray-100 text-gray-700' },
}

export function SessionHistoryItem({
  session,
  isExpanded,
  onToggleExpand,
}: SessionHistoryItemProps) {
  const statusInfo = statusConfig[session.status]
  const StatusIcon = statusInfo.icon
  const paymentInfo = paymentStatusConfig[session.paymentStatus]

  return (
    <div className="rounded-md border border-muted/80 dark:border-muted/40 bg-muted/60 dark:bg-muted/30 overflow-hidden hover:bg-muted/70 dark:hover:bg-muted/10 transition-colors">
      {/* Header - Always Visible */}
      <div
        onClick={onToggleExpand}
        className="p-4 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Status Indicator Bar */}
          <div className="flex flex-col gap-1">
            <div
              className={`w-1 h-6 rounded-full ${
                session.status === 'realizada'
                  ? 'bg-green-500'
                  : session.status === 'cancelada'
                    ? 'bg-red-500'
                    : session.status === 'remarcada'
                      ? 'bg-blue-500'
                      : 'bg-orange-500'
              }`}
              title={statusInfo.label}
            />
            <div
              className={`w-1 h-6 rounded-full ${
                session.paymentStatus === 'paga'
                  ? 'bg-green-500'
                  : session.paymentStatus === 'pendente'
                    ? 'bg-yellow-500'
                    : 'bg-gray-400'
              }`}
              title={paymentInfo.label}
            />
          </div>

          <Avatar className="size-12">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 grid grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr_auto] gap-6 items-center">
            {/* Patient & Date */}
            <div className="min-w-0">
              <h3 className="font-medium text-foreground truncate text-[15px]">
                {session.patientName}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {new Date(session.date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}{' '}
                • {session.startTime}
              </p>
            </div>

            {/* Modality */}
            <div className="flex items-center gap-2.5">
              {session.modality === 'online' ? (
                <>
                  <div className="p-1.5 bg-blue-100 rounded-md dark:bg-blue-700/10">
                    <Video className="w-4 h-4 text-blue-700 dark:text-blue-700" />
                  </div>
                  <span className="text-sm text-accent-foreground">Online</span>
                </>
              ) : (
                <>
                  <div className="p-1.5 bg-purple-100 rounded-md dark:bg-purple-700/10">
                    <MapPin className="w-4 h-4 text-purple-700 dark:text-purple-700" />
                  </div>
                  <span className="text-sm text-accent-foreground">
                    Presencial
                  </span>
                </>
              )}
            </div>

            {/* Session Status */}
            <div className="flex items-center gap-2">
              <StatusIcon
                className={`w-4 h-4 ${
                  session.status === 'realizada'
                    ? 'text-green-600'
                    : session.status === 'cancelada'
                      ? 'text-red-600'
                      : session.status === 'remarcada'
                        ? 'text-blue-600'
                        : 'text-orange-600'
                }`}
              />
              <span className="text-sm text-muted-foreground">
                {statusInfo.label}
              </span>
            </div>

            {/* Payment Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  session.paymentStatus === 'paga'
                    ? 'bg-green-500'
                    : session.paymentStatus === 'pendente'
                      ? 'bg-yellow-500'
                      : 'bg-gray-400'
                }`}
              />
              <span className="text-sm text-muted-foreground">
                {paymentInfo.label}
              </span>
            </div>

            {/* Value */}
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                R$ {session.value.toFixed(2)}
              </p>
              {session.paymentMethod && (
                <p className="text-xs text-muted-foreground capitalize mt-0.5">
                  {session.paymentMethod === 'pix' ? 'PIX' : 'Cartão'}
                </p>
              )}
            </div>

            {/* Expand Button */}
            <button className="p-1.5 hover:bg-muted/10 rounded-md transition-colors flex-shrink-0">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-foreground/40" />
              ) : (
                <ChevronDown className="w-4 h-4 text-foreground/40" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-muted dark:border-muted/40 bg-transparent">
          <div className="p-6 grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Dados do Agendamento
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted-foreground/5 rounded-lg">
                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duração</p>
                      <p className="text-sm font-medium text-foreground">
                        50 minutos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted-foreground/5 rounded-lg">
                    {session.modality === 'online' ? (
                      <>
                        <Video className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground">
                            Link da Reunião
                          </p>
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 truncate block"
                          >
                            Abrir Google Meet
                          </a>
                        </div>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Endereço
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {session.address}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h4 className="text-sm font-semibold text-accent-foreground mb-3">
                  Controle Financeiro
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted-foreground/5 rounded-lg">
                    <DollarSign className="w-5 h-5 text-foreground/40 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-foreground/40">Valor Cobrado</p>
                      <p className="text-sm font-medium text-accent-foreground">
                        R$ {session.value.toFixed(2)}
                      </p>
                    </div>
                    {session.paymentMethod && (
                      <div className="text-right">
                        <p className="text-xs text-foreground/40">Método</p>
                        <p className="text-sm font-medium text-accent-foreground capitalize">
                          {session.paymentMethod === 'pix' ? 'PIX' : 'Cartão'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-muted-foreground/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle
                        className={`w-4 h-4 ${
                          session.paymentStatus === 'paga'
                            ? 'text-green-600'
                            : session.paymentStatus === 'pendente'
                              ? 'text-yellow-600'
                              : 'text-foreground/40'
                        }`}
                      />
                      <p className="text-xs text-foreground/40">
                        Status do Pagamento
                      </p>
                    </div>
                    <p
                      className={`text-sm font-medium ${
                        session.paymentStatus === 'paga'
                          ? 'text-green-600'
                          : session.paymentStatus === 'pendente'
                            ? 'text-yellow-600'
                            : 'text-foreground/40'
                      }`}
                    >
                      {session.paymentStatus === 'paga' &&
                        'Pagamento confirmado'}
                      {session.paymentStatus === 'pendente' &&
                        'Aguardando pagamento'}
                      {session.paymentStatus === 'liberada' &&
                        'Horário liberado (não pago até D-1 12h)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* AI Interactions */}
              <div>
                <h4 className="text-sm font-semibold text-accent-foreground mb-3">
                  Secretária Virtual (IA)
                </h4>
                <div className="p-4 bg-muted-foreground/5 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    {session.confirmationSent ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm text-accent-foreground">
                      Cliente{' '}
                      {session.confirmationSent ? 'confirmou' : 'não confirmou'}{' '}
                      presença
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs text-foreground/40 mb-2">
                      Lembretes Enviados:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        {session.remindersSent.d1 ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-accent-foreground">D-1 (1 dia antes)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {session.remindersSent.t2h ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-accent-foreground">
                          T-2h (2 horas antes)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {session.remindersSent.t30min ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-accent-foreground">
                          T-30min (30 minutos antes)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality Evaluation */}
              {session.npsScore !== undefined && (
                <div>
                  <h4 className="text-sm font-semibold text-accent-foreground mb-3">
                    Avaliação Pós-Sessão
                  </h4>
                  <div className="p-4 bg-muted-foreground/5 rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500 dark:text-yellow-500 dark:fill-yellow-500" />
                      </div>
                      <div>
                        <p className="text-xs text-foreground/40">NPS Score</p>
                        <p className="text-xl font-semibold text-accent-foreground">
                          {session.npsScore}/10
                        </p>
                      </div>
                    </div>

                    {session.feedback && (
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-foreground/40 mt-1 shrink-0" />
                          <div>
                            <p className="text-xs text-foreground/40 mb-1">
                              Comentário do Paciente:
                            </p>
                            <p className="text-sm text-accent-foreground italic">
                              "{session.feedback}"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
