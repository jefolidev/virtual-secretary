import { useEffect, useState } from 'react'

export function OAuthCallbackPage() {
  const [status, setStatus] = useState('Processando autenticação...')

  useEffect(() => {
    // Get callback parameters from URL
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const error = urlParams.get('error')

    console.log('=== OAuth Callback Debug ===')
    console.log('Full URL:', window.location.href)
    console.log('Origin:', window.location.origin)
    console.log('Port:', window.location.port)
    console.log('Code:', code)
    console.log('State:', state)
    console.log('Error:', error)
    console.log('Has opener:', !!window.opener)
    console.log('Parent origin:', window.opener ? 'accessible' : 'N/A')

    if (error) {
      setStatus(`Erro: ${error}`)
      setTimeout(() => {
        if (window.opener) {
          console.log('Sending ERROR to opener...')
          window.opener.postMessage(
            {
              type: 'GOOGLE_OAUTH_ERROR',
              error,
            },
            window.location.origin,
          )
          window.close()
        } else {
          window.location.href = '/settings/account'
        }
      }, 2000)
      return
    }

    if (code && state) {
      if (window.opener) {
        console.log('Sending SUCCESS to opener...')
        console.log('Target origin:', window.location.origin)
        console.log('Message:', { type: 'GOOGLE_OAUTH_SUCCESS', code, state })

        setStatus('Sincronização concluída! Fechando janela...')

        // Send message to parent window
        window.opener.postMessage(
          {
            type: 'GOOGLE_OAUTH_SUCCESS',
            code,
            state,
          },
          window.location.origin,
        )

        // Close the popup after a short delay
        setTimeout(() => {
          console.log('Closing popup...')
          window.close()
        }, 1000)
      } else {
        console.log('No opener, redirecting...')
        setStatus('Redirecionando...')
        window.location.href = '/settings/account'
      }
    } else {
      console.log('Missing code or state')
      setStatus('Parâmetros inválidos. Redirecionando...')
      setTimeout(() => {
        window.location.href = '/settings/account'
      }, 2000)
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{status}</h1>
        <p className="text-muted-foreground">
          {window.opener
            ? 'Esta janela será fechada automaticamente.'
            : 'Você será redirecionado em instantes.'}
        </p>
      </div>
    </div>
  )
}
