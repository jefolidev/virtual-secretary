import type { NotificationType } from '@/types/user'

export const getNotificationLabel = (type: NotificationType): string => {
  switch (type) {
    case 'NEW_APPOINTMENT':
      return 'Novos agendamentos'
    case 'CANCELLATION':
      return 'Cancelamentos'
    case 'CONFIRMATION':
      return 'Confirmações de consulta'
    case 'DAILY_SUMMARY':
      return 'Resumo diário de agenda'
    case 'CONFIRMED_LIST':
      return 'Lista de confirmados do dia'
    case 'PAYMENT_STATUS':
      return 'Notificações de pagamento'
    default:
      return type
  }
}
