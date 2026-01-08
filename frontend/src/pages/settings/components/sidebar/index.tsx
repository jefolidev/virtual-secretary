import { Button } from '@/components/ui/button'
import { BellRing, NotepadText, UserCog2 } from 'lucide-react'
import { Link, useLocation } from 'react-router'

// Menu items com mapeamento de seção
const items = [
  {
    title: 'Conta',
    path: 'account',
    icon: UserCog2,
  },
  {
    title: 'Notificações',
    path: 'notifications',
    icon: BellRing,
  },
  {
    title: 'Consultas',
    path: 'consultations',
    icon: NotepadText,
  },
]

export function SettingsSidebar() {
  const location = useLocation()

  return (
    <div className="w-64 border-r  p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Configurações</h2>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = location.pathname.endsWith(item.path)

          return (
            <Button
              key={item.path}
              variant={isActive ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              asChild
            >
              <Link to={item.path}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
