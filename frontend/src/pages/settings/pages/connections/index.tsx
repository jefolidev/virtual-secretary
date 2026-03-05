import { googleCalendarService } from '@/api/endpoints/google-calendar'
import { mercadoPagoServices } from '@/api/endpoints/mercado-pago'
import type { MercadoPagoStatus } from '@/api/endpoints/mercado-pago/dto'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { GoogleLogoIcon } from '@phosphor-icons/react'
import { CreditCard, Link2, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { ConnectionItem } from './components/connection-item'

export function ConnectionsSettingsPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [gcConnected, setGcConnected] = useState(false)
  const [gcSyncing, setGcSyncing] = useState(false)

  const [mpStatus, setMpStatus] = useState<MercadoPagoStatus | null>(null)
  const [mpLoading, setMpLoading] = useState(true)

  // Handle redirect back from Mercado Pago OAuth
  useEffect(() => {
    const mpConnected = searchParams.get('mp_connected')
    if (mpConnected === 'true') {
      toast.success('Mercado Pago conectado com sucesso!')
      fetchMpStatus()
      setSearchParams({}, { replace: true })
    } else if (mpConnected === 'false') {
      const error = searchParams.get('error')
      toast.error(`Erro ao conectar Mercado Pago${error ? `: ${error}` : ''}`)
      setSearchParams({}, { replace: true })
    }
  }, [])

  useEffect(() => {
    if (!user?.professional_id) return
    googleCalendarService
      .isGoogleCalendarConnected(user.professional_id)
      .then(setGcConnected)
      .catch(() => setGcConnected(false))
  }, [user?.professional_id])

  async function fetchMpStatus() {
    setMpLoading(true)
    try {
      const status = await mercadoPagoServices.getStatus()
      setMpStatus(status)
    } catch {
      setMpStatus(null)
    } finally {
      setMpLoading(false)
    }
  }

  useEffect(() => {
    fetchMpStatus()
  }, [])

  // --- Google Calendar ---
  async function handleGcConnect() {
    if (!user?.professional_id) return
    setGcSyncing(true)
    try {
      const { url } = await googleCalendarService.getAuthUrl(
        user.professional_id,
      )

      const width = 600
      const height = 700
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      const authWindow = window.open(
        url,
        'Google OAuth',
        `width=${width},height=${height},left=${left},top=${top}`,
      )

      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        if (
          event.data?.source === 'react-devtools-content-script' ||
          event.data?.source === 'react-devtools-bridge'
        )
          return

        if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage)
          setGcSyncing(false)
          setGcConnected(true)
          authWindow?.close()
          toast.success('Google Calendar conectado com sucesso!')
        } else if (event.data?.type === 'GOOGLE_OAUTH_ERROR') {
          window.removeEventListener('message', handleMessage)
          setGcSyncing(false)
          authWindow?.close()
          toast.error('Erro ao conectar Google Calendar')
        }
      }

      window.addEventListener('message', handleMessage)

      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          setGcSyncing(false)
        }
      }, 500)
    } catch {
      setGcSyncing(false)
      toast.error('Erro ao iniciar conexão com Google Calendar')
    }
  }

  function handleGcDisconnect() {
    toast.info(
      'Para desconectar, revogue o acesso em myaccount.google.com/permissions',
    )
  }

  // --- Mercado Pago ---
  async function handleMpConnect() {
    try {
      await mercadoPagoServices.connect()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Erro ao conectar com Mercado Pago'
      toast.error(message)
    }
  }

  async function handleMpDisconnect() {
    await mercadoPagoServices.disconnect()
    await fetchMpStatus()
    toast.success('Mercado Pago desconectado')
  }

  // --- WhatsApp (system-level) ---
  const whatsappConnected = !!user?.whatsappNumber

  function handleWhatsappConnect() {
    toast.info(
      'Adicione seu número de WhatsApp em Configurações > Conta para ativar as notificações.',
    )
  }

  function handleWhatsappDisconnect() {
    toast.info(
      'Remova seu número de WhatsApp em Configurações > Conta para desativar as notificações.',
    )
  }

  const mpLastSync = mpStatus?.connectedAt
    ? new Date(mpStatus.connectedAt).toLocaleDateString('pt-BR')
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Conexões
        </CardTitle>
        <CardDescription>
          Gerencie integrações e conexões com serviços de terceiros para
          aprimorar sua experiência.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <ConnectionItem
            icon={
              <GoogleLogoIcon
                weight="bold"
                className="text-gray-700 dark:text-gray-100"
                size={18}
              />
            }
            title="Google Calendar"
            description="Sincronização automática de agendamentos"
            isConnected={gcConnected}
            isSyncing={gcSyncing}
            lastSync={gcConnected ? 'Sincronizado' : null}
            onConnect={handleGcConnect}
            onDisconnect={handleGcDisconnect}
          />

          <ConnectionItem
            icon={
              <CreditCard
                className="text-gray-700 dark:text-gray-100"
                size={18}
              />
            }
            title="Mercado Pago"
            description="Receba pagamentos diretamente na sua conta"
            isConnected={mpStatus?.connected ?? false}
            hasError={mpStatus?.status === 'ERROR'}
            isSyncing={mpLoading}
            lastSync={mpLastSync}
            onConnect={handleMpConnect}
            onDisconnect={handleMpDisconnect}
          />

          <ConnectionItem
            icon={
              <Phone className="text-gray-700 dark:text-gray-100" size={18} />
            }
            title="WhatsApp"
            description="Envio automático de lembretes e notificações"
            isConnected={whatsappConnected}
            lastSync={whatsappConnected ? 'Ativo' : null}
            onConnect={handleWhatsappConnect}
            onDisconnect={handleWhatsappDisconnect}
          />
        </div>
      </CardContent>
    </Card>
  )
}
