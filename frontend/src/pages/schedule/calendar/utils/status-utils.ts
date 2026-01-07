import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  DollarSign,
  RotateCcw,
  UserX,
  XCircle,
} from 'lucide-react'
import type { Appointment } from '../types'

// Função para obter cores dos status
export const getStatusStyles = (status: Appointment['status']) => {
  switch (status) {
    case 'agendado':
      return {
        bg: 'bg-blue-200 dark:bg-blue-950',
        border: 'border-blue-300 dark:border-blue-800',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-blue-500',
        iconBg: 'bg-blue-400 dark:bg-blue-800',
        headerBg: 'bg-blue-500 dark:bg-blue-600',
        label: getStatusLabel(status),
      }
    case 'confirmado':
      return {
        bg: 'bg-green-200 dark:bg-green-950',
        border: 'border-green-300 dark:border-green-800',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-green-500',
        iconBg: 'bg-green-400 dark:bg-green-800',
        headerBg: 'bg-green-500 dark:bg-green-600',
        label: getStatusLabel(status),
      }
    case 'cancelado':
      return {
        bg: 'bg-red-200 dark:bg-red-950',
        border: 'border-red-300 dark:border-red-800',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-red-500',
        iconBg: 'bg-red-400 dark:bg-red-800',
        headerBg: 'bg-red-500 dark:bg-red-600',
        label: getStatusLabel(status),
      }
    case 'finalizado':
      return {
        bg: 'bg-emerald-200 dark:bg-emerald-950',
        border: 'border-emerald-300 dark:border-emerald-800',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-emerald-500',
        iconBg: 'bg-emerald-400 dark:bg-emerald-800',
        headerBg: 'bg-emerald-500 dark:bg-emerald-600',
        label: getStatusLabel(status),
      }
    case 'nao-pago':
      return {
        bg: 'bg-orange-200 dark:bg-orange-950',
        border: 'border-orange-300 dark:border-orange-800',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-orange-500',
        iconBg: 'bg-orange-400 dark:bg-orange-800',
        headerBg: 'bg-orange-500 dark:bg-orange-600',
        label: getStatusLabel(status),
      }
    case 'pago':
      return {
        bg: 'bg-teal-200 dark:bg-teal-950',
        border: 'border-teal-300 dark:border-teal-800',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-teal-500',
        iconBg: 'bg-teal-400 dark:bg-teal-800',
        headerBg: 'bg-teal-500 dark:bg-teal-600',
        label: getStatusLabel(status),
      }
    case 'no-show':
      return {
        bg: 'bg-purple-200 dark:bg-purple-950',
        border: 'border-purple-300 dark:border-purple-800',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-purple-500',
        iconBg: 'bg-purple-400 dark:bg-purple-800',
        headerBg: 'bg-purple-500 dark:bg-purple-600',
        label: getStatusLabel(status),
      }
    case 'remarcado':
      return {
        bg: 'bg-yellow-200 dark:bg-yellow-950',
        border: 'border-yellow-300 dark:border-yellow-800',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-yellow-500',
        iconBg: 'bg-yellow-400 dark:bg-yellow-800',
        headerBg: 'bg-yellow-500 dark:bg-yellow-600',
        label: getStatusLabel(status),
      }
    default:
      return {
        bg: 'bg-gray-200 dark:bg-gray-950',
        border: 'border-gray-300 dark:border-gray-800',
        text: 'text-zinc-800 dark:text-white',
        dotColor: 'bg-gray-500',
        iconBg: 'bg-gray-400 dark:bg-gray-800',
        headerBg: 'bg-gray-500 dark:bg-gray-600',
        label: getStatusLabel(status),
      }
  }
}

// Função auxiliar para obter labels
export const getStatusLabel = (status: Appointment['status']) => {
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
export const getStatusIcon = (status: Appointment['status']) => {
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
