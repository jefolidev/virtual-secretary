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
import { UserProvider } from '@/hooks/use-user'
import {
  Bell,
  BookUser,
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  DollarSign,
  File,
  LogOut,
  Moon,
  Settings,
  Star,
  Sun,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'

const menuItems = [
  {
    title: 'Agenda',
    url: 'calendar',
    icon: CalendarIcon,
    description: 'Monitore e gerencie as suas consultas',
  },
  {
    title: 'Clientes',
    url: 'clients',
    icon: Users,
    items: [
      {
        title: 'Lista de Clientes',
        url: 'clients/list',
        icon: BookUser,
      },
      {
        title: 'Histórico de Sessões',
        url: 'clients/history',
        icon: Users,
      },
    ],
  },
  {
    title: 'Financeiro',
    icon: DollarSign,
    url: 'finance',
  },
  {
    title: 'Relatórios',
    icon: File,
    items: [
      {
        title: 'Satisfação',
        url: 'analytics/satisfaction',
        icon: Star,
      },
      {
        title: 'Lucros',
        url: 'analytics/profits',
        icon: DollarSign,
      },
    ],
  },
]

function AppContent() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

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

  const toggleMenu = (menuTitle: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuTitle)
        ? prev.filter((item) => item !== menuTitle)
        : [...prev, menuTitle],
    )
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
                {menuItems.map((item) => (
                  <div key={item.title}>
                    {/* Item principal */}
                    {item.items ? (
                      // Item com submenu - expansível (exibe igual ao 'Clientes')
                      <>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => toggleMenu(item.title)}
                            className="w-full justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                            <ChevronRight
                              className={`h-4 w-4 transition-transform duration-200 group-data-[collapsible=icon]:hidden ${
                                expandedMenus.includes(item.title)
                                  ? 'rotate-90'
                                  : ''
                              }`}
                            />
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        {/* Submenus */}
                        {expandedMenus.includes(item.title) && item.items && (
                          <div className="ml-6 space-y-1 group-data-[collapsible=icon]:ml-0">
                            {item.items.map((subItem) => (
                              <SidebarMenuItem key={subItem.title}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={location.pathname === subItem.url}
                                  className="text-sm pl-6 group-data-[collapsible=icon]:pl-2 opacity-90 hover:opacity-100 text-muted-foreground hover:text-foreground data-[active=true]:opacity-100 data-[active=true]:text-foreground"
                                >
                                  <Link to={subItem.url}>
                                    <subItem.icon className="h-3.5 w-3.5 opacity-80" />
                                    <span className="group-data-[collapsible=icon]:sr-only">
                                      {subItem.title}
                                    </span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      // Item sem submenu - link direto
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === item.url}
                        >
                          <Link to={item.url ?? '#'}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </div>
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
                      className="mx-1 flex items-center gap-2 px-2 py-1.5 "
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
            {(() => {
              // Busca por item principal direto
              const mainItem = menuItems.find(
                (item) => item.url === location.pathname,
              )
              if (mainItem) return mainItem.title

              // Busca em subitens
              for (const item of menuItems) {
                if (item.items) {
                  const subItem = item.items.find(
                    (sub) => sub.url === location.pathname,
                  )
                  if (subItem) return subItem.title
                }
              }

              return 'Mindly'
            })()}
          </h1>
        </header>

        <div className="flex-1 max-h-screen">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mindly-theme">
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ThemeProvider>
  )
}
