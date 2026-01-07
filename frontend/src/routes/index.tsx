import { App } from '@/app'
import { useAuth } from '@/contexts/auth-context'
import { LoginPage } from '@/pages/login'
import { ScheduleCalendarPage } from '@/pages/schedule/calendar'
import { SignUpPage } from '@/pages/signup'
import { ScreensEnum } from '@/types/screens'
import {
  Navigate,
  Outlet,
  createBrowserRouter,
  useLocation,
} from 'react-router'

function RequireAuth() {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()

  // Aguarda o carregamento do estado de auth
  if (isLoading) {
    return <div>Carregando...</div>
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        to={`/${ScreensEnum.LOGIN}`}
        state={{ from: location }}
      />
    )
  }

  return <Outlet />
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  // Aguarda o carregamento do estado de auth
  if (isLoading) {
    return <div>Carregando...</div>
  }

  if (isAuthenticated) {
    return <Navigate replace to={`/${ScreensEnum.DASHBOARD}`} />
  }

  return children
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate replace to={`/${ScreensEnum.DASHBOARD}`} />,
      },
      {
        path: ScreensEnum.LOGIN,
        element: (
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        ),
      },
      {
        path: ScreensEnum.SIGNUP,
        element: (
          <PublicOnly>
            <SignUpPage />
          </PublicOnly>
        ),
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: ScreensEnum.DASHBOARD,
            element: <div>Dashboard</div>,
          },
          {
            path: ScreensEnum.SETTINGS,
            element: <div>Settings</div>,
          },
          // Agenda
          {
            path: 'agenda/calendario',
            element: <ScheduleCalendarPage />,
          },
          {
            path: 'agenda/bloqueios',
            element: <div>Bloqueios de Horário</div>,
          },
          // Minha Secretária IA
          {
            path: 'secretaria-ia',
            element: <div>Minha Secretária IA</div>,
          },
          // Pacientes
          {
            path: 'pacientes/fichas',
            element: <div>Fichas/Prontuários</div>,
          },
          {
            path: 'pacientes/avaliacoes',
            element: <div>Avaliações (NPS)</div>,
          },
          // Financeiro
          {
            path: 'financeiro/recebimentos',
            element: <div>Recebimentos</div>,
          },
          {
            path: 'financeiro/dados-bancarios',
            element: <div>Dados Bancários</div>,
          },
          // Configurações da Clínica
          {
            path: 'configuracoes/horarios',
            element: <div>Horários de Trabalho</div>,
          },
          {
            path: 'configuracoes/mensagens',
            element: <div>Mensagens Automáticas</div>,
          },
          // Rotas legacy mantidas temporariamente
          {
            path: 'appointments',
            element: <div>Agendamentos</div>,
          },
          {
            path: 'messages',
            element: <div>Mensagens</div>,
          },
          {
            path: 'search',
            element: <div>Buscar</div>,
          },
        ],
      },
      {
        path: '*',
        element: <div>Página não encontrada</div>,
      },
    ],
  },
])
