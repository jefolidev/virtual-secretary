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

    console.log('=== Google Auth Success Page ===')
    console.log('URL:', window.location.href)
    console.log('Token:', token)
    console.log('Email:', email)
    console.log('Name:', name)
    console.log('Picture:', picture)
    console.log('Error:', error)
    console.log('Has opener:', !!window.opener)
    console.log('Window opener value:', window.opener)
    console.log('Is popup?', window.opener !== null)

    if (error) {
      setStatus(`Erro: ${error}`)
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_ERROR',
            error: decodeURIComponent(error),
          },
          window.location.origin,
        )
        setTimeout(() => window.close(), 2000)
      } else {
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      }
      return
    }

    if (token && email && name) {
      setStatus('Login realizado com sucesso!')
      console.log('Sending postMessage to opener...')

      if (window.opener && !window.opener.closed) {
        const message = {
          type: 'GOOGLE_AUTH_SUCCESS',
          data: {
            token: decodeURIComponent(token),
            email: decodeURIComponent(email),
            name: decodeURIComponent(name),
            picture: picture ? decodeURIComponent(picture) : '',
          },
        }

        console.log('Message:', message)
        console.log('Target origin:', window.location.origin)

        try {
          window.opener.postMessage(message, window.location.origin)
          console.log('Message sent successfully!')
        } catch (e) {
          console.error('Failed to send message:', e)
        }

        console.log('Closing popup in 1 second...')
        setTimeout(() => {
          console.log('Closing now!')
          window.close()
        }, 1000)
      } else {
        console.log(
          'No opener found or opener is closed. Saving token and redirecting...',
        )
        localStorage.setItem('access_token', decodeURIComponent(token))

        // Tenta fechar a janela (vai funcionar se for popup)
        setTimeout(() => {
          const closed = window.close()
          console.log('Tried to close window:', closed)

          // Se não conseguiu fechar (não é popup), redireciona
          setTimeout(() => {
            if (!window.closed) {
              console.log('Window still open, redirecting to home...')
              window.location.href = '/'
            }
          }, 100)
        }, 1000)
      }
    } else {
      setStatus('Parâmetros inválidos')
      setTimeout(() => {
        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'GOOGLE_AUTH_ERROR',
              error: 'Invalid parameters',
            },
            window.location.origin,
          )
          window.close()
        } else {
          window.location.href = '/login'
        }
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
