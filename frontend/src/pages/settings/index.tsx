import { Outlet } from 'react-router'
import { SettingsSidebar } from './components/sidebar'

export function SettingsPage() {
  return (
    <div className="flex h-full">
      <SettingsSidebar />

      {/* Conteúdo principal */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  )
}
