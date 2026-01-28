import { Toaster } from '@/components/ui/sonner'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from './contexts/auth-context'
import { ProfessionalProvider } from './contexts/professional-context'
import './index.css'
import { router } from './routes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ProfessionalProvider>
        <div className="w-full h-screen ">
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </div>
      </ProfessionalProvider>
    </AuthProvider>
  </StrictMode>,
)
