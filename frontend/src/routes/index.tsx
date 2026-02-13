import { App } from '@/app'
import { useAuth } from '@/contexts/auth-context'
import { GoogleAuthSuccessPage } from '@/pages/auth/google/success'
import { ListClientsPage } from '@/pages/clients/list-clients'
import { SessionHistory } from '@/pages/clients/session-history'
import { LoginPage } from '@/pages/login'
import { OAuthCallbackPage } from '@/pages/oauth-callback'
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
    return <Navigate replace to={`/${ScreensEnum.CALENDAR}`} />
  }

  return children
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
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
        path: 'oauth-callback',
        element: <OAuthCallbackPage />,
      },
      {
        path: '/auth/google/success',
        element: <GoogleAuthSuccessPage />,
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: ScreensEnum.CALENDAR,
            element: <ScheduleCalendarPage />,
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
          // Clients
          {
            path: `/${ScreensEnum.CLIENTS}/list`,
            element: <ListClientsPage />,
          },
          {
            path: `/${ScreensEnum.CLIENTS}/history`,
            element: <SessionHistory />,
          },
          // Financial
          {
            path: `/${ScreensEnum.FINANCE}`,
            element: <div>Financeiro</div>,
          },
          // Clinic Settings
          {
            path: `/${ScreensEnum.ANALYTICS}/satisfaction`,
            element: <div>Satisfação</div>,
          },
          {
            path: `/${ScreensEnum.ANALYTICS}/profits`,
            element: <div>Lucros</div>,
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
