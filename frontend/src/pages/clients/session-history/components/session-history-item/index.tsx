import {
  CheckCircle,
  ChevronRight,
  CircleCheck,
  CreditCard,
  MapPin,
  Star,
  Video,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

import type { FetchProfessionalSchedulesResponse } from '@/api/endpoints/appointments/dto'
import type {
  AppointmentModalities,
  AppointmentsStatus,
  PaymentStatus,
} from '@/api/schemas/fetch-professional-schedules.dto'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getStatusLabel } from '@/pages/schedule/calendar/utils/status-utils'
import { StatusIcon } from './components/status-icon'

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
  const { reminders, evaluation } = appointment

  // Rating state
  const [editingRating, setEditingRating] = useState(false)
  const ratingScore = evaluation?.score ?? null
  const ratingComment = evaluation?.comment ?? null
  const hasRating = ratingScore !== null
  const canRate = appointment.status === 'COMPLETED'

  const scoreBadgeStyle = (score: number) => {
    if (score >= 9)
      return 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900'
    if (score >= 7)
      return 'bg-neutral-500 dark:bg-neutral-400 text-white dark:text-neutral-900'
    return 'bg-neutral-400 dark:bg-neutral-600 text-white dark:text-neutral-200'
  }

  function getStatusBadgeClasses(status: AppointmentsStatus) {
    if (status === 'SCHEDULED')
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
    if (status === 'CONFIRMED')
      return 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
    if (status === 'IN_PROGRESS')
      return 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
    if (status === 'COMPLETED')
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
    if (status === 'CANCELLED')
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500'
    if (status === 'RESCHEDULED')
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
    if (status === 'NO_SHOW')
      return 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-500 line-through'
    return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  }

  function getModalityClasses(modality: AppointmentModalities) {
    return 'text-muted-foreground'
  }

  function getPaymentStatus(paymentStatus: PaymentStatus) {
    if (paymentStatus === 'SUCCEEDED') return 'Pago'
    if (paymentStatus === 'PENDING') return 'Pendente'
    if (paymentStatus === 'PROCESSING') return 'Em processo'
    if (paymentStatus === 'REFUNDED') return 'Reembolsado'
    return 'Não Pago'
  }

  function getPaymentBadgeClasses(paymentStatus: PaymentStatus) {
    if (paymentStatus === 'SUCCEEDED')
      return 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900'
    if (paymentStatus === 'PENDING')
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500'
    if (paymentStatus === 'PROCESSING')
      return 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
    if (paymentStatus === 'REFUNDED')
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500 line-through'
    return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formattedDate = new Date(appointment.startDateTime).toLocaleDateString(
    'pt-BR',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  )

  const formattedTime = new Date(appointment.startDateTime).toLocaleTimeString(
    'pt-BR',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  )

  const duration = 50 // minutos

  return (
    <div
      className={`bg-card rounded-xl border transition-all overflow-hidden ${
        isExpanded
          ? 'border-border shadow-sm'
          : 'border-border hover:border-border/80'
      }`}
    >
      {/* Main Row */}
      <button
        className="w-full text-left px-5 py-4 flex items-center gap-4 group"
        onClick={onToggleExpand}
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <span className="text-[11px] font-semibold text-muted-foreground">
            {getInitials(name)}
          </span>
        </div>

        {/* Patient + Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-foreground truncate">
              {name}
            </span>
            <span className="text-[11px] text-muted-foreground shrink-0">
              #{appointment.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-muted-foreground">
              {formattedDate}
            </span>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-[11px] text-muted-foreground">
              {formattedTime}
            </span>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-[11px] text-muted-foreground">
              {duration} min
            </span>
          </div>
        </div>

        {/* Modality */}
        <div
          className={`hidden sm:flex items-center gap-1.5 text-[11px] shrink-0 ${getModalityClasses(appointment.modality)}`}
        >
          {appointment.modality === 'ONLINE' ? (
            <Video className="w-3.5 h-3.5" />
          ) : (
            <MapPin className="w-3.5 h-3.5" />
          )}
          <span>
            {appointment.modality === 'ONLINE' ? 'Online' : 'Presencial'}
          </span>
        </div>

        {/* Session Status */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 ${getStatusBadgeClasses(appointment.status)}`}
        >
          <StatusIcon status={appointment.status} />
          {getStatusLabel(appointment.status)}
        </div>

        {/* Payment Status */}
        <div
          className={`hidden lg:flex px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 ${getPaymentBadgeClasses(appointment.paymentStatus)}`}
        >
          {getPaymentStatus(appointment.paymentStatus)}
        </div>

        {/* Value */}
        <div className="text-[13px] font-medium text-foreground shrink-0 tabular-nums">
          R$ {appointment.agreedPrice.toFixed(2)}
        </div>

        {/* Expand chevron */}
        <ChevronRight
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-border pt-4 space-y-6">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                Status da Sessão
              </div>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium ${getStatusBadgeClasses(appointment.status)}`}
              >
                <StatusIcon status={appointment.status} />
                {getStatusLabel(appointment.status)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                Pagamento
              </div>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium ${getPaymentBadgeClasses(appointment.paymentStatus)}`}
              >
                <CreditCard className="w-3 h-3" />
                {getPaymentStatus(appointment.paymentStatus)} · R${' '}
                {appointment.agreedPrice.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                Modalidade
              </div>
              <div
                className={`flex items-center gap-1.5 text-[12px] ${getModalityClasses(appointment.modality)}`}
              >
                {appointment.modality === 'ONLINE' ? (
                  <Video className="w-3.5 h-3.5" />
                ) : (
                  <MapPin className="w-3.5 h-3.5" />
                )}
                {appointment.modality === 'ONLINE' ? 'Online' : 'Presencial'}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Location/Link Info */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
              {appointment.modality === 'ONLINE' ? 'Link da Reunião' : 'Local'}
            </div>
            {appointment.modality === 'ONLINE' ? (
              <a
                href={appointment.googleMeetLink || ''}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5" />
                Abrir Google Meet
              </a>
            ) : (
              <p className="text-[12px] text-muted-foreground">
                {address.props.addressLine1}
              </p>
            )}
          </div>

          <Separator className="my-4" />

          {/* Virtual Secretary Section */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-medium">
              Secretária Virtual (IA)
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {appointment.status === 'CONFIRMED' ? (
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-[12px] text-foreground">
                  Cliente{' '}
                  <strong>
                    {appointment.status === 'CONFIRMED'
                      ? 'confirmou'
                      : 'não confirmou'}
                  </strong>{' '}
                  a presença
                </span>
              </div>

              <div className="pl-6 space-y-2">
                <p className="text-[10px] text-muted-foreground mb-2">
                  Lembretes Enviados:
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[12px]">
                    {reminders && reminders[0]?.type === 'D1_REMINDER' ? (
                      <CircleCheck
                        className="text-muted-foreground"
                        size={14}
                      />
                    ) : (
                      <XCircle className="text-muted-foreground" size={14} />
                    )}
                    <span className="text-foreground">24 horas antes</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px]">
                    {reminders && reminders[0]?.type === 'T2H_REMINDER' ? (
                      <CircleCheck
                        className="text-muted-foreground"
                        size={14}
                      />
                    ) : (
                      <XCircle className="text-muted-foreground" size={14} />
                    )}
                    <span className="text-foreground">2 horas antes</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px]">
                    {reminders && reminders[0]?.type === 'T30M_REMINDER' ? (
                      <CircleCheck
                        className="text-muted-foreground"
                        size={14}
                      />
                    ) : (
                      <XCircle className="text-muted-foreground" size={14} />
                    )}
                    <span className="text-foreground">30 minutos antes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Rating Section */}
          <div className="rounded-xl border border-border bg-muted/30 px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
                  Avaliação do Paciente
                </span>
              </div>
              {canRate && !editingRating && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingRating(true)
                  }}
                  className="h-auto py-1 px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                >
                  {hasRating ? 'Editar' : '+ Adicionar'}
                </Button>
              )}
            </div>

            {/* Has rating and not editing: display view */}
            {hasRating && !editingRating && (
              <div className="flex items-start gap-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold shrink-0 ${scoreBadgeStyle(
                    ratingScore!,
                  )}`}
                >
                  {ratingScore}
                </div>
                <div className="flex-1 min-w-0">
                  {/* Mini dot bar */}
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i < ratingScore!
                            ? ratingScore! >= 9
                              ? 'bg-neutral-800 dark:bg-neutral-200'
                              : ratingScore! >= 7
                                ? 'bg-neutral-500 dark:bg-neutral-400'
                                : 'bg-neutral-400 dark:bg-neutral-600'
                            : 'bg-neutral-200 dark:bg-neutral-800'
                        }`}
                      />
                    ))}
                  </div>
                  {ratingComment ? (
                    <p className="text-[12px] text-muted-foreground leading-relaxed italic">
                      "{ratingComment}"
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic">
                      Sem comentário
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* No rating and not editing: empty state */}
            {!hasRating && !editingRating && (
              <div className="flex items-center gap-3 py-1">
                {canRate ? (
                  <>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div
                          key={i}
                          className="h-1.5 w-6 rounded-full bg-neutral-200 dark:bg-neutral-800"
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Nenhuma avaliação recebida
                    </span>
                  </>
                ) : (
                  <span className="text-[11px] text-muted-foreground">
                    Avaliação disponível após a realização da sessão
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
