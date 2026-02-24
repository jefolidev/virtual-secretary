import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  MapPin,
  MessageSquare,
  Star,
  Video,
  XCircle,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getStatusLabel } from '@/pages/schedule/calendar/utils/status-utils'
import { ModalityIcon } from './components/modality-icon'
import { StatusIcon } from './components/status-icon'
import type { FetchProfessionalSchedulesResponse } from '@/api/endpoints/appointments/dto'
import type { AppointmentsStatus, AppointmentModalities, PaymentStatus } from '@/api/schemas/fetch-professional-schedules.dto'

interface SessionHistoryItemProps {
  session: FetchProfessionalSchedulesResponse
  isExpanded: boolean
  onToggleExpand: () => void
}

export function SessionHistoryItem({
  session,
  isExpanded,
  onToggleExpand,
}: SessionHistoryItemProps) {
  const { appointment, address, name } = session

  function getStatusColor(status: AppointmentsStatus, isLabel: boolean = false) {
    if (status === 'COMPLETED') return isLabel ? 'text-green-500' : 'bg-green-500'
    if (status === 'CANCELLED') return isLabel ? 'text-red-500' : 'bg-red-500'
    if (status === 'RESCHEDULED') return isLabel ? 'text-blue-500' : 'bg-blue-500'
    return isLabel ? 'text-orange-500' : 'bg-orange-500'
  }

  function getModalityColor(modality: AppointmentModalities, isLabel: boolean = false) {
    if (modality === 'ONLINE') return isLabel ? 'text-blue-500' : 'bg-blue-500'
    if (modality === 'IN_PERSON') return isLabel ? 'text-purple-500' : 'bg-purple-500'
    return isLabel ? 'text-gray-500' : 'bg-gray-500'
  }

  function getPaymentStatus(paymentStatus: PaymentStatus) {
    if (paymentStatus === 'SUCCEEDED') return 'Pago'
    if (paymentStatus === 'PENDING') return 'Pendente'
    return 'Não Pago'
  }

  function getPaymentColor(paymentStatus: PaymentStatus, isLabel: boolean = false) {
    if (paymentStatus === 'SUCCEEDED') return isLabel ? 'text-green-500' : 'bg-green-500'
    if (paymentStatus === 'PENDING') return isLabel ? 'text-yellow-500' : 'bg-yellow-500'
    return isLabel ? 'text-gray-500' : 'bg-gray-500'
  }

  return (
    <div className="bg-foreground/1 rounded-lg border border-foreground/5 overflow-hidden hover:bg-muted/40 dark:hover:bg-muted/10 transition-colors">
      {/* Header - Always Visible */}
      <div onClick={onToggleExpand} className="p-4 cursor-pointer transition-colors">
        <div className="flex items-center gap-4">
          {/* Status Indicator Bar */}
          <div className="flex flex-col gap-1">
            <div
              className={`w-1 h-6 rounded-full ${getStatusColor(appointment.status)}`}
              title={getStatusColor(appointment.status)}
            />
            <div
              className={`w-1 h-6 rounded-full ${getPaymentColor(appointment.paymentStatus)}`}
              title={getPaymentColor(appointment.paymentStatus)}
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
                {name}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {new Date(appointment.startDateTime).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}{' '}
                •{' '}
                {new Date(appointment.startDateTime).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* Modality */}
            <div className="flex items-center gap-2.5">
              <ModalityIcon modality={appointment.modality} />
              <span className={`text-sm text-accent-foreground ${getModalityColor(appointment.modality, true)}`}>
                {appointment.modality === 'ONLINE' ? 'Online' : 'Presencial'}
              </span>
            </div>

            {/* Session Status */}
            <div className="flex items-center gap-2">
              <StatusIcon status={appointment.status} />
              <span className={`text-sm text-muted-foreground font-medium ${getStatusColor(appointment.status, true)}`}>
                {getStatusLabel(appointment.status)}
              </span>
            </div>

            {/* Payment Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getPaymentColor(appointment.paymentStatus)}`} />
              <span className={`text-sm text-muted-foreground font-medium ${getPaymentColor(appointment.paymentStatus, true)}`}>
                {getPaymentStatus(appointment.paymentStatus)}
              </span>
            </div>

            {/* Value */}
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                R$ {appointment.agreedPrice.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">PIX</p>
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
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Dados do Agendamento
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted-foreground/5 rounded-lg">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duração</p>
                      <p className="text-sm font-medium text-foreground">50 minutos</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted-foreground/5 rounded-lg">
                    {appointment.modality === 'ONLINE' ? (
                      <>
                        <Video className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground">Link da Reunião</p>
                          <a
                            href={appointment.googleMeetLink || ''}
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
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Endereço</p>
                          <p className="text-sm font-medium text-foreground">
                            {address.props.addressLine1}
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
                    <DollarSign className="w-4 h-4 text-foreground/40 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-foreground/40">Valor Cobrado</p>
                      <p className="text-sm font-medium text-accent-foreground">
                        R$ {appointment.agreedPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-muted-foreground/5 rounded-lg flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4" />
                      <p className="text-xs text-foreground/40">Status do Pagamento</p>
                    </div>
                    <p className="text-sm font-medium ml-6">
                      {getPaymentStatus(appointment.paymentStatus)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-accent-foreground mb-3">
                  Secretária Virtual (IA)
                </h4>
                <div className="p-4 bg-muted-foreground/5 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    {appointment.status === 'CONFIRMED' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm text-accent-foreground">
                      Cliente{' '}
                      <strong>
                        {appointment.status === 'CONFIRMED' ? 'confirmou' : 'não confirmou'}
                      </strong>{' '}
                      a presença
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs text-foreground/40 mb-2">Lembretes Enviados:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-accent-foreground">T-2h (2 horas antes)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-accent-foreground">T-30min (30 minutos antes)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {appointment.evaluation != null && (
                <div>
                  <h4 className="text-sm font-semibold text-accent-foreground mb-3">
                    Avaliação Pós-Sessão
                  </h4>
                  <div className="p-4 bg-muted-foreground/5 rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                      </div>
                      <div>
                        <p className="text-xs text-foreground/40">NPS Score</p>
                        <p className="text-xl font-semibold text-accent-foreground">
                          {appointment.evaluation.score}/10
                        </p>
                      </div>
                    </div>

                    {appointment.evaluation.comment && (
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-foreground/40 mt-1 shrink-0" />
                          <div>
                            <p className="text-xs text-foreground/40 mb-1">
                              Comentário do Paciente:
                            </p>
                            <p className="text-sm text-accent-foreground italic">
                              "{appointment.evaluation.comment}"
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