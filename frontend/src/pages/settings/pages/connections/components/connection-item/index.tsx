import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Check, Loader2, X } from 'lucide-react'
import { useState, type JSX } from 'react'

export interface ConnectionItemProps {
  title: string
  icon: JSX.Element
  description: string
  lastSync: string | null
  isConnected: boolean
  hasError?: boolean
  isSyncing?: boolean
  onConnect: () => void | Promise<void>
  onDisconnect: () => void | Promise<void>
  autoSync?: boolean
  onAutoSyncChange?: (enabled: boolean) => void
}

export function ConnectionItem({
  title,
  icon,
  description,
  lastSync,
  isConnected,
  hasError,
  isSyncing,
  onConnect,
  onDisconnect,
}: ConnectionItemProps) {
  const [isActing, setIsActing] = useState(false)

  const isBusy = isSyncing || isActing

  function getStatusLabel() {
    if (isBusy) return 'Sincronizando'
    if (hasError) return 'Erro'
    if (isConnected) return 'Conectado'
    return 'Desconectado'
  }

  function getStatusClasses() {
    if (isBusy) {
      return 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
    }
    if (hasError) {
      return 'bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400'
    }
    if (isConnected) {
      return 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
    }
    return 'bg-gray-500/10 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400'
  }

  function getStatusIcon() {
    if (isBusy) return <Loader2 size={13} className="animate-spin" />
    if (hasError) return <AlertCircle size={13} />
    if (isConnected) return <Check size={13} />
    return <X size={13} />
  }

  function getButtonState() {
    if (isBusy) {
      return {
        disabled: true,
        label: 'Aguarde...',
        icon: <Loader2 size={14} className="animate-spin" />,
        action: 'busy' as const,
      }
    }
    if (hasError) {
      return {
        disabled: false,
        label: 'Tentar novamente',
        icon: <AlertCircle size={14} />,
        action: 'disconnect' as const,
      }
    }
    if (isConnected) {
      return {
        disabled: false,
        label: 'Desconectar',
        icon: <X size={14} />,
        action: 'disconnect' as const,
      }
    }
    return { disabled: false, label: 'Conectar', icon: null, action: 'connect' as const }
  }

  async function handleButtonClick() {
    const action = getButtonState().action
    setIsActing(true)
    try {
      if (action === 'disconnect') {
        await onDisconnect()
      } else {
        await onConnect()
      }
    } finally {
      setIsActing(false)
    }
  }

  const buttonState = getButtonState()

  return (
    <div className="flex flex-col p-6 border border-gray-100 dark:border-gray-800 rounded-md">
      <div className="flex justify-between">
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
          {icon}
        </div>
        <div
          className={`${getStatusClasses()} flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium max-h-7`}
        >
          {getStatusIcon()} {getStatusLabel()}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 my-4">
        <div className="flex flex-col gap-1">
          <Label className="text-base">{title}</Label>
          <Label className="text-[11px] text-muted-foreground">
            {description}
          </Label>
        </div>

        <Label className="text-xs text-muted-foreground/50">
          Última sync: {lastSync ?? 'Nunca'}
        </Label>
      </div>

      <Separator />

      <Button
        size="lg"
        className="flex rounded-xl gap-2 mt-4"
        disabled={buttonState.disabled}
        onClick={handleButtonClick}
      >
        {buttonState.icon}
        {buttonState.label}
      </Button>
    </div>
  )
}
