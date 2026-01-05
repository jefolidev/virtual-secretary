import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from './contexts/auth-context'
import './index.css'
import { router } from './routes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <div className="w-full h-screen ">
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  </StrictMode>
)
