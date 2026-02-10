import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

export function GoogleAuthError() {
  const [searchParams] = useSearchParams()
  const [countdown, setCountdown] = useState(3)
  const error = searchParams.get('error') || 'Erro desconhecido'

  useEffect(() => {
    console.log('=== Google Auth Error Page ===')
    console.log('Error:', error)
    console.log('Has window.opener:', !!window.opener)

    // Envia mensagem de erro para a janela pai
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_ERROR',
            error,
          },
          window.location.origin,
        )
        console.log('Error message sent to opener')
      } catch (err) {
        console.error('Failed to send error message:', err)
      }
    }

    // Countdown para fechar
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          // Tenta fechar o popup
          window.close()
          // Se não conseguir fechar (não é popup), redireciona
          setTimeout(() => {
            if (!window.closed) {
              window.location.href = '/login'
            }
          }, 100)
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Erro na Autenticação
          </h2>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <p className="mt-4 text-xs text-gray-500">
            Fechando em {countdown} segundo{countdown !== 1 ? 's' : ''}...
          </p>
        </div>
      </div>
    </div>
  )
}
