import { Stethoscope, User } from 'lucide-react'
import { useSignupForm } from '../../contexts/form-context'

export function UserTypeSelection() {
  const { formData, updateFormData } = useSignupForm()

  const handleSelectUserType = (type: 'professional' | 'patient') => {
    updateFormData('userType', type)
  }

  return (
    <div className="flex justify-center gap-12">
      <button
        type="button"
        onClick={() => handleSelectUserType('professional')}
        className="flex flex-col items-center gap-3 transition-all cursor-pointer"
      >
        <div
          className={
            formData.userType === 'professional'
              ? 'flex h-24 w-24 items-center justify-center rounded-full bg-zinc-800 transition-all'
              : 'flex h-24 w-24 items-center justify-center rounded-full bg-zinc-300 opacity-50 transition-all hover:opacity-70'
          }
        >
          <Stethoscope
            className={
              formData.userType === 'professional'
                ? 'h-10 w-10 text-white'
                : 'h-10 w-10 text-zinc-600'
            }
          />
        </div>
        <span
          className={
            formData.userType === 'professional'
              ? 'text-sm font-medium text-zinc-900'
              : 'text-sm text-zinc-500'
          }
        >
          Profissional
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleSelectUserType('patient')}
        className="flex flex-col items-center gap-3 transition-all cursor-pointer"
      >
        <div
          className={
            formData.userType === 'patient'
              ? 'flex h-24 w-24 items-center justify-center rounded-full bg-zinc-800 transition-all'
              : 'flex h-24 w-24 items-center justify-center rounded-full bg-zinc-300 opacity-50 transition-all hover:opacity-70'
          }
        >
          <User
            className={
              formData.userType === 'patient'
                ? 'h-10 w-10 text-white'
                : 'h-10 w-10 text-zinc-600'
            }
          />
        </div>
        <span
          className={
            formData.userType === 'patient'
              ? 'text-sm font-medium text-zinc-900'
              : 'text-sm text-zinc-500'
          }
        >
          Paciente
        </span>
      </button>
    </div>
  )
}
