import { authToken } from '@/auth/auth-token'
import { useEffect, useState } from 'react'

export function GoogleAuthSuccessPage() {
  const [status, setStatus] = useState('Processando autenticação...')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const email = urlParams.get('email')
    const name = urlParams.get('name')
    const picture = urlParams.get('picture')
    const error = urlParams.get('error')

    if (error) {
      console.error('Authentication error:', error)
      setStatus(`Erro na autenticação: ${error}`)

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

      setTimeout(() => {
        window.close()
      }, 3000)
      return
    }

    if (token && email && name) {
      setStatus('Autenticação bem-sucedida! Fechando janela...')

      // Salva o token
      authToken.set(token)

      // Verifica se foi aberto como popup
      if (window.opener && !window.opener.closed) {

        try {
          // Envia a estrutura que o código espera
          window.opener.postMessage(
            {
              type: 'GOOGLE_AUTH_SUCCESS',
              data: {
                access_token: token,
                user: {
                  email,
                  name,
                  picture: picture || '',
                },
              },
            },
            window.location.origin,
          )

          // Fecha o popup após enviar a mensagem
          setTimeout(() => {
            window.close()
          }, 500)
        } catch (err) {
          console.error('Failed to send message to opener:', err)
          setTimeout(() => {
            window.close()
          }, 500)
        }
      } else {
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1000)
      }
    } else {
      console.error('Missing auth data')
      setStatus('Erro: dados de autenticação incompletos')

      setTimeout(() => {
        if (window.opener && !window.opener.closed) {
          window.close()
        } else {
          window.location.href = '/login'
        }
      }, 3000)
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Autenticação Google
          </h2>
          <p className="mt-2 text-sm text-gray-600">{status}</p>
        </div>
      </div>
    </div>
  )
}
