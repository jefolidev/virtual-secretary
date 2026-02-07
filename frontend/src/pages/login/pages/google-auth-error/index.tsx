import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

export function GoogleAuthError() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error') || 'Unknown error'

    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'GOOGLE_AUTH_ERROR',
          error,
        },
        window.location.origin,
      )

      window.close()
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Erro no login</h1>
        <p className="text-gray-600">
          Esta janela será fechada automaticamente...
        </p>
      </div>
    </div>
  )
}
