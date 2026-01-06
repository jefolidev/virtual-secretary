import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/auth-context'
import { ThemeProvider, useTheme } from '@/hooks/use-theme'
import {
  Bell,
  Calendar,
  ChevronDown,
  ChevronUp,
  Home,
  Inbox,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'

const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Agendamentos',
    url: '/appointments',
    icon: Calendar,
  },
  {
    title: 'Mensagens',
    url: '/messages',
    icon: Inbox,
  },
  {
    title: 'Buscar',
    url: '/search',
    icon: Search,
  },
  {
    title: 'Configurações',
    url: '/settings',
    icon: Settings,
  },
]

function AppContent() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  // Estado persistente da sidebar
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar-open')
    return saved !== null ? JSON.parse(saved) : true
  })

  // Salvar estado da sidebar no localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen))
  }, [sidebarOpen])

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  // Rotas que não devem mostrar a sidebar
  const publicRoutes = ['/login', '/signup']
  const isPublicRoute = publicRoutes.includes(location.pathname)

  // Se for rota pública, só renderiza o Outlet sem sidebar
  if (isPublicRoute) {
    return <Outlet />
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-between px-2 py-4 group-data-[collapsible=icon]:justify-center">
            <h2
              className="text-2xl font-bold group-data-[collapsible=icon]:hidden"
              style={{ fontFamily: 'Dancing Script, cursive' }}
            >
              Mindly
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0"
              title={`Tema atual: ${theme}`}
            >
              {theme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : theme === 'light' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <div className="h-4 w-4 rounded-full bg-linear-to-r from-yellow-500 to-blue-500" />
              )}
            </Button>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="p-1 group-data-[collapsible=icon]:p-1">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer hover:bg-accent rounded-md p-1 transition-colors group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:rounded-full">
                    <div className="flex items-center gap-1.5 group-data-[collapsible=icon]:justify-center">
                      <Avatar className="w-6 h-6 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8">
                        <AvatarFallback
                          className={`text-white text-xs font-medium group-data-[collapsible=icon]:text-sm ${
                            theme === 'dark' ? 'bg-blue-500' : 'bg-purple-600'
                          }`}
                          title={user.name}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                        <p className="text-xs font-medium truncate">
                          {user.name}
                        </p>
                      </div>
                      <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <ChevronUp className="h-1.5 w-1.5" />
                        <ChevronDown className="h-1.5 w-1.5" />
                      </div>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 ml-16">
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold ${
                          theme === 'dark' ? 'bg-blue-500' : 'bg-purple-600'
                        }`}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="py-1">
                    <DropdownMenuItem asChild className="mx-1">
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-2 py-1.5"
                      >
                        <Settings className="h-4 w-4" />
                        Configurações
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="mx-1 flex items-center gap-2 px-2 py-1.5">
                      <Bell className="h-4 w-4" />
                      <span>Notificações</span>
                    </DropdownMenuItem>
                  </div>
                  <Separator />
                  <div className="py-1">
                    <DropdownMenuItem
                      onClick={logout}
                      className="mx-1 flex items-center gap-2 px-2 py-1.5 text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-6" />
          <h1 className="font-semibold">
            {items.find((item) => item.url === location.pathname)?.title ||
              'Mindly'}
          </h1>
        </header>

        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mindly-theme">
      <AppContent />
    </ThemeProvider>
  )
}
