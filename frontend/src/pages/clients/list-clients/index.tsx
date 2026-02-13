import { api } from '@/api/axios'
import type { Appointment } from '@/api/schemas/fetch-professional-schedules.dto'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Calendar, Filter, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ClientCard, type ClientCardProps } from './components/client-card'
import { ControlBar } from './components/control-bar'
import { isRegisteredContact } from './utils/is-user-registred'

export interface ClientRegistredContacts {
  isRegistered: boolean
  user: {
    name: string
    email: string
    cpf: string
    whatsappNumber: string
    createdAt: Date
  }
  client: {
    periodPreference: Array<'MORNNING' | 'AFTERNOON' | 'EVENING'>
    extraPreferences: string
  }
  whatsappContact: {
    phone: string | null
    nickName: string | null
    profilePicUrl: string | null
    whatsappNumber: string | null
    isRegistred: boolean
    isOnline: boolean
    lastSeen: string | null
    metadata: any | null
    createdAt: string
    updatedAt: string
  }
  appointments: Appointment[]
}

export interface ClientUnlinkedContacts {
  userId: string | null
  nickname: string | null
  profilePicUrl: string | null
  whatsappNumber: string | null
  isRegistred: boolean
  isOnline: boolean
  lastSeen: string | null
  metadata: any | null
  createdAt: string
  updatedAt: string
}
type ClientContactsResponse = Array<
  ClientRegistredContacts | ClientUnlinkedContacts
>
type FilterType = 'all' | 'registered' | 'unregistered'
type SortType = 'name' | 'recent' | 'appointments'

export function ListClientsPage() {
  const [clients, setClients] = useState<ClientContactsResponse>([])
  const [filteredClients, setFilteredClients] =
    useState<ClientContactsResponse>([])

  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortType, setSortType] = useState<SortType>('name')

  const [searchedUser, setSearchedUser] = useState<string>('')

  const handleFetchClients = async () => {
    try {
      const response = await api.get<ClientContactsResponse>(
        `/contacts/users?filter=${filterType}&order=${sortType}`,
      )

      setClients(response.data)
      setFilteredClients(response.data)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchedUser(query)

    const filteredClients = clients.filter((client) => {
      const name = isRegisteredContact(client)
        ? client.user.name
        : client.nickname

      if (!name) return ''

      return name.toLowerCase().includes(query.toLowerCase())
    })
    setFilteredClients(filteredClients)
  }

  useEffect(() => {
    handleFetchClients()
  }, [filterType, sortType])

  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div>
      <div className="flex justify-between items-center mb-2 py-6 border-b px-8">
        <div>
          <h1 className="text-2xl font-semibold">Gerenciamento de Pacientes</h1>
          <span className="text-sm  text-muted-foreground">
            Visualize e gerencie todos os pacientes que já entraram em contato
            com a clínica.
          </span>
        </div>

        <ControlBar
          stats={{
            online: clients.filter(
              (client) =>
                isRegisteredContact(client) && client.whatsappContact.isOnline,
            ).length,
            registered: clients.filter((client) => isRegisteredContact(client))
              .length,
            unregistered: clients.filter(
              (client) => !isRegisteredContact(client),
            ).length,
            total: clients.length,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="bg-foreground/5 rounded-lg border border-foreground/20 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email, telefone ou CPF..."
                value={searchedUser}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-white dark:bg-transparent"
              />
            </div>

            {/* Filter by Type */}
            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value as FilterType)}
            >
              <SelectTrigger className="w-full md:w-50 bg-white dark:bg-transparent">
                <Filter className="size-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Pacientes</SelectItem>
                <SelectItem value="registered">Cadastrados</SelectItem>
                <SelectItem value="unregistered">Não Cadastrados</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={sortType}
              onValueChange={(value) => setSortType(value as SortType)}
            >
              <SelectTrigger className="w-full md:w-50 bg-white dark:bg-transparent">
                <Calendar className="size-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Ordenar por Nome</SelectItem>
                <SelectItem value="recent">Mais Recentes</SelectItem>
                <SelectItem value="appointments">Mais Consultas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="mt-5" />
          {/* Active Filters */}
          {(searchQuery || filterType !== 'all') && (
            <div className="flex items-center gap-2  pt-4  border-gray-100">
              <span className="text-sm text-accent-foreground">
                Filtros ativos:
              </span>
              {searchQuery && (
                <Badge variant="default" className="gap-1">
                  Busca: {searchQuery}
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-accent-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filterType !== 'all' && (
                <Badge variant="default" className="gap-1">
                  Tipo:{' '}
                  {filterType === 'registered'
                    ? 'Cadastrados'
                    : filterType === 'unregistered'
                      ? 'Não Cadastrados'
                      : 'Online'}
                  <button
                    onClick={() => setFilterType('all')}
                    className="ml-1 hover:text-gray-900"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setFilterType('all')
                }}
                className="text-xs ml-auto"
              >
                Limpar todos
              </Button>
            </div>
          )}
        </div>
      </div>

      <p className="pl-7 text-sm mb-2 text-foreground/50">
        {clients.length} pacientes encontrado
      </p>
      <div
        className="grid gap-4 px-6"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
      >
        {filteredClients.map((client) => {
          if (isRegisteredContact(client)) {
            return (
              <ClientCard
                key={client.user.cpf}
                data={{
                  ...client,
                  client: client.client,
                  whatsappContact: client.whatsappContact,
                  appointments: client.appointments,
                }}
              />
            )
          } else {
            return (
              <ClientCard
                key={client.whatsappNumber || client.nickname || Math.random()}
                data={
                  {
                    ...client,
                    isRegistered: false,
                  } as ClientCardProps['data']
                }
              />
            )
          }
        })}
      </div>
    </div>
  )
}
