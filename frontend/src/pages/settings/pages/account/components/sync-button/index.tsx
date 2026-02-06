import type { UserLoginData } from '@/api/endpoints/auth'
import { googleCalendarService } from '@/api/endpoints/google-calendar'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface SyncButtonProps {
  user: UserLoginData
  // isSynced: boolean
}

export function SyncButton({ user }: SyncButtonProps) {
  const [isSynced, setIsSynced] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const { getAuthUrl, isGoogleCalendarConnected } = googleCalendarService

  const watchIsGoogleCalendarConnected = async () => {
    const isConnected = await isGoogleCalendarConnected(user.professional_id!)

    isConnected ? setIsSynced(true) : setIsSynced(false)
  }

  useEffect(() => {
    const fetchData = async () => {
      const result = await watchIsGoogleCalendarConnected()
    }

    fetchData()
  }, [user])

  const handleSync = async () => {
    try {
      setIsSyncing(true)

      // Primeiro, pegar a URL do Google OAuth através da API
      const { url: googleOAuthUrl } = await getAuthUrl(user.professional_id!)

      // Abrir popup diretamente com a URL do Google
      const width = 600
      const height = 700
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      const authWindow = window.open(
        googleOAuthUrl,
        'Google OAuth',
        `width=${width},height=${height},left=${left},top=${top}`,
      )

      const handleMessage = async (event: MessageEvent) => {
        if (
          event.data?.source === 'react-devtools-content-script' ||
          event.data?.source === 'react-devtools-bridge'
        ) {
          return
        }

        // Validate origin
        if (event.origin !== window.location.origin) {
          return
        }

        if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage)
          setIsSyncing(false)

          if (authWindow && !authWindow.closed) {
            authWindow.close()
          }

          toast.success(
            'Sincronização com Google Calendar realizada com sucesso!',
          )

          // Reload to update sync status
          setTimeout(() => {
            window.location.reload()
          }, 500)
        } else if (event.data?.type === 'GOOGLE_OAUTH_ERROR') {
          console.error('OAuth Error Details:', event.data.error)

          window.removeEventListener('message', handleMessage)
          setIsSyncing(false)

          if (authWindow && !authWindow.closed) {
            authWindow.close()
          }

          toast.error(
            `Erro na autenticação do Google: ${event.data.error || 'Erro desconhecido'}`,
          )
        }
      }

      window.addEventListener('message', handleMessage)

      // Poll for window closure as fallback
      const checkWindow = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkWindow)
          window.removeEventListener('message', handleMessage)
          setIsSyncing(false)

          toast.info('Janela de autenticação fechada.')
        }
      }, 500)
    } catch (error) {
      setIsSyncing(false)
      toast.error('Erro ao sincronizar com o Google Calendar.')
    }
  }

  return (
    <Button
      className={`${isSynced || isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
      variant={isSynced ? 'outline' : 'default'}
      disabled={isSynced || isSyncing}
      onClick={() => handleSync()}
    >
      {isSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isSyncing
        ? 'Sincronizando...'
        : isSynced
          ? 'Sincronizado'
          : 'Sincronizar com Google'}
    </Button>
  )
}
