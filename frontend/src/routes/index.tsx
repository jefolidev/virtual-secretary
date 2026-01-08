import { App } from '@/app'
import { useAuth } from '@/contexts/auth-context'
import { LoginPage } from '@/pages/login'
import { ScheduleCalendarPage } from '@/pages/schedule/calendar'
import { SettingsPage } from '@/pages/settings'
import { AccountSettingsPage } from '@/pages/settings/pages/account/index'
import { ConsultationsSettingsPage } from '@/pages/settings/pages/consultations/index'
import { NotificationsSettingsPage } from '@/pages/settings/pages/notifications/index'
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
            element: <SettingsPage />,
            children: [
              {
                index: true,
                element: <Navigate replace to="account" />,
              },
              {
                path: 'account',
                element: <AccountSettingsPage />,
              },
              {
                path: 'notifications',
                element: <NotificationsSettingsPage />,
              },
              {
                path: 'consultations',
                element: <ConsultationsSettingsPage />,
              },
            ],
          },
          // Schedule
          {
            path: 'schedule/calendar',
            element: <ScheduleCalendarPage />,
          },
          {
            path: 'schedule/blocks',
            element: <div>Bloqueios de Horário</div>,
          },
          // AI Secretary
          {
            path: 'ai-secretary',
            element: <div>Minha Secretária IA</div>,
          },
          // Patients
          {
            path: 'patients/records',
            element: <div>Fichas/Prontuários</div>,
          },
          {
            path: 'patients/evaluations',
            element: <div>Avaliações (NPS)</div>,
          },
          // Financial
          {
            path: 'financial/receivables',
            element: <div>Recebimentos</div>,
          },
          {
            path: 'financial/bank-data',
            element: <div>Dados Bancários</div>,
          },
          // Clinic Settings
          {
            path: 'clinic-settings/schedules',
            element: <div>Horários de Trabalho</div>,
          },
          {
            path: 'clinic-settings/messages',
            element: <div>Mensagens Automáticas</div>,
          },
          // Legacy routes maintained temporarily
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
