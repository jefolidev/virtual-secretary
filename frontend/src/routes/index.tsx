import { LoginPage } from '@/pages/login'
import { SignUpPage } from '@/pages/signup'
import { ScreensEnum } from '@/types/screens'
import {
  Navigate,
  Outlet,
  createBrowserRouter,
  useLocation,
} from 'react-router'

function isAuthenticated() {
  return Boolean(localStorage.getItem('token'))
}

function RequireAuth() {
  const location = useLocation()

  if (!isAuthenticated()) {
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
  if (isAuthenticated()) {
    return <Navigate replace to={`/${ScreensEnum.DASHBOARD}`} />
  }

  return children
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate replace to={`/${ScreensEnum.DASHBOARD}`} />,
  },
  {
    path: `/${ScreensEnum.LOGIN}`,
    element: (
      <PublicOnly>
        <LoginPage />
      </PublicOnly>
    ),
  },
  {
    path: `/${ScreensEnum.SIGNUP}`,
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
        path: `/${ScreensEnum.DASHBOARD}`,
        element: <div>Dashboard</div>,
      },
      {
        path: `/${ScreensEnum.SETTINGS}`,
        element: <div>Settings</div>,
      },
    ],
  },
  {
    path: '*',
    element: <div>Página não encontrada</div>,
  },
])
