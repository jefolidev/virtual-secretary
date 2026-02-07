import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { GoogleLogoIcon } from '@phosphor-icons/react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

export function GoogleButton() {
  const { handleLoginWithGoogle } = useAuth()

  const navigate = useNavigate()

  const loginGoogle = async () => {
    try {
      await handleLoginWithGoogle()
      navigate('/dashboard')
    } catch (error) {
      toast.error('Erro ao fazer login com Google. Por favor, tente novamente.')
      console.error('Erro no login com Google:', error)
    }
  }

  return (
    <div className="w-full">
      <Button
        onClick={loginGoogle}
        variant={'outline'}
        className="w-full rounded-full"
      >
        <GoogleLogoIcon weight="bold" className="w-5.5 h-5.5" />
        Continuar com Google
      </Button>
    </div>
  )
}
