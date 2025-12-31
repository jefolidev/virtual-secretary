import { Stethoscope, User } from 'lucide-react'

interface UserTypeSelectionProps {
  userType: 'professional' | 'patient' | null
  onSelectUserType: (type: 'professional' | 'patient') => void
}

export function UserTypeSelection({
  userType,
  onSelectUserType,
}: UserTypeSelectionProps) {
  return (
    <div className="flex justify-center gap-12">
      <button
        type="button"
        onClick={() => onSelectUserType('professional')}
        className="flex flex-col items-center gap-3 transition-all cursor-pointer"
      >
        <div
          className={
            userType === 'professional'
              ? 'flex h-24 w-24 items-center justify-center rounded-full bg-zinc-800 transition-all'
              : 'flex h-24 w-24 items-center justify-center rounded-full bg-zinc-300 opacity-50 transition-all hover:opacity-70'
          }
        >
          <Stethoscope
            className={
              userType === 'professional'
                ? 'h-10 w-10 text-white'
                : 'h-10 w-10 text-zinc-600'
            }
          />
        </div>
        <span
          className={
            userType === 'professional'
              ? 'text-sm font-medium text-zinc-900'
              : 'text-sm text-zinc-500'
          }
        >
          Profissional
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSelectUserType('patient')}
        className="flex flex-col items-center gap-3 transition-all cursor-pointer"
      >
        <div
          className={
            userType === 'patient'
              ? 'flex h-24 w-24 items-center justify-center rounded-full bg-zinc-800 transition-all'
              : 'flex h-24 w-24 items-center justify-center rounded-full bg-zinc-300 opacity-50 transition-all hover:opacity-70'
          }
        >
          <User
            className={
              userType === 'patient'
                ? 'h-10 w-10 text-white'
                : 'h-10 w-10 text-zinc-600'
            }
          />
        </div>
        <span
          className={
            userType === 'patient'
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
