import { api } from '@/api/axios'
import type { Appointment } from '@/api/schemas/fetch-professional-schedules.dto'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ChevronDown, Filter, Search } from 'lucide-react'
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

  const selectClass =
    'w-full pl-3 pr-8 py-2 text-xs bg-transparent text-foreground border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring transition-colors appearance-none cursor-pointer'

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
    <>
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

      <div className="px-6 py-4">
        <div className="bg-card rounded-2xl border border-border px-6 py-5 space-y-4 mb-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome, email, telefone ou CPF..."
              value={searchedUser}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-transparent text-foreground placeholder:text-muted-foreground border-b border-border focus:outline-none focus:border-ring transition-colors"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-medium text-muted-foreground mb-1.5">
                <Filter className="inline w-3 h-3 mr-1 opacity-70" />
                Tipo de Paciente
              </label>
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
                  className={selectClass}
                >
                  <option value="all">Todos os Pacientes</option>
                  <option value="registered">Cadastrados</option>
                  <option value="unregistered">Não Cadastrados</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-medium text-muted-foreground mb-1.5">
                <ArrowUpDown className="inline w-3 h-3 mr-1 opacity-70" />
                Ordenar por
              </label>
              <div className="relative">
                <select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value as SortType)}
                  className={selectClass}
                >
                  <option value="name">Ordenar por Nome</option>
                  <option value="recent">Mais Recentes</option>
                  <option value="appointments">Mais Consultas</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

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
    </>
  )
}
