import { AppSidebar } from '@/components/sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen">
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <SidebarTrigger />
          </div>
          <div className="flex-1 min-h-0">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
