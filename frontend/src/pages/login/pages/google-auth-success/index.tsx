import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

export function GoogleAuthSuccess() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('access_token')
    const email = searchParams.get('email')
    const name = searchParams.get('name')
    const picture = searchParams.get('picture')

    if (window.opener) {
      // Envia mensagem para a janela pai (popup)
      window.opener.postMessage(
        {
          type: 'GOOGLE_AUTH_SUCCESS',
          data: { token, email, name, picture },
        },
        window.location.origin,
      )

      window.close()
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          Login realizado com sucesso!
        </h1>
        <p className="text-gray-600">
          Esta janela será fechada automaticamente...
        </p>
      </div>
    </div>
  )
}
