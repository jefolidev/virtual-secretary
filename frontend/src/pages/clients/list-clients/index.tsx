import { api } from '@/api/axios'
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

const mockClient: ClientCardProps[] = [
  {
    data: {
      name: 'João Silva',
      email: 'joao.silva@example.com',
      phone: '123-456-7890',
      cpf: '123.456.789-00',
      appointments: [
        {
          id: 'apt-joao-1',
          professionalId: 'prof-1',
          clientId: 'client-joao',
          modality: 'IN_PERSON',
          googleMeetLink: null,
          rescheduleDateTime: null,
          status: 'SCHEDULED',
          agreedPrice: 150,
          paymentStatus: 'PENDING',
          paymentExpiresAt: null,
          currentTransactionId: null,
          startDateTime: new Date('2026-02-15T10:00:00'),
          endDateTime: new Date('2026-02-15T10:30:00'),
          startedAt: null,
          totalElapsedMs: null,
          createdAt: new Date('2026-01-01T09:00:00'),
          updatedAt: new Date('2026-01-01T09:00:00'),
        },
        {
          id: 'apt-joao-2',
          professionalId: 'prof-1',
          clientId: 'client-joao',
          modality: 'ONLINE',
          googleMeetLink: 'https://meet.example/abc123',
          rescheduleDateTime: null,
          status: 'COMPLETED',
          agreedPrice: 120,
          paymentStatus: 'SUCCEEDED',
          paymentExpiresAt: null,
          currentTransactionId: 'txn-123',
          startDateTime: new Date('2026-01-30T14:00:00'),
          endDateTime: new Date('2026-01-30T14:30:00'),
          startedAt: new Date('2026-01-30T14:00:00'),
          totalElapsedMs: 30 * 60 * 1000,
          createdAt: new Date('2026-01-01T09:00:00'),
          updatedAt: new Date('2026-01-30T15:00:00'),
        },
      ],
      isOnline: true,
      isRegistered: true,
      lastActivity: new Date('2026-02-09T14:30:00'),
      createdAt: new Date('2025-12-12T10:00:00'),
    },
  },
  {
    data: {
      name: 'Maria Oliveira',
      email: 'maria.oliveira@example.com',
      phone: '987-654-3210',
      cpf: '987.654.321-00',
      appointments: [],
      isOnline: false,
      isRegistered: false,
      lastActivity: new Date('2026-01-15T14:30:00'),
      createdAt: new Date('2026-01-10T09:00:00'),
    },
  },
  {
    data: {
      name: 'Pedro Santos',
      email: 'pedro.santos@example.com',
      phone: '555-123-9876',
      cpf: '321.654.987-11',
      appointments: [
        {
          id: 'apt-pedro-1',
          professionalId: 'prof-2',
          clientId: 'client-pedro',
          modality: 'IN_PERSON',
          googleMeetLink: null,
          rescheduleDateTime: null,
          status: 'COMPLETED',
          agreedPrice: 200,
          paymentStatus: 'SUCCEEDED',
          paymentExpiresAt: null,
          currentTransactionId: 'txn-200',
          startDateTime: new Date('2026-02-05T09:00:00'),
          endDateTime: new Date('2026-02-05T09:30:00'),
          startedAt: new Date('2026-02-05T09:00:00'),
          totalElapsedMs: 30 * 60 * 1000,
          createdAt: new Date('2026-01-20T10:00:00'),
          updatedAt: new Date('2026-02-05T10:00:00'),
        },
      ],
      isOnline: false,
      isRegistered: true,
      lastActivity: new Date('2026-02-05T10:00:00'),
      createdAt: new Date('2026-01-20T10:00:00'),
    },
  },
  {
    data: {
      name: 'Ana Pereira',
      email: 'ana.pereira@example.com',
      phone: '444-555-6666',
      cpf: '555.666.777-88',
      appointments: [],
      isOnline: true,
      isRegistered: true,
      lastActivity: new Date('2026-02-10T09:30:00'),
      createdAt: new Date('2026-02-01T08:00:00'),
    },
  },
  {
    data: {
      name: 'Carlos Mendes',
      email: 'carlos.mendes@example.com',
      phone: '222-333-4444',
      cpf: '111.222.333-44',
      appointments: [
        {
          id: 'apt-carlos-1',
          professionalId: 'prof-3',
          clientId: 'client-carlos',
          modality: 'ONLINE',
          googleMeetLink: 'https://meet.example/xyz',
          rescheduleDateTime: null,
          status: 'SCHEDULED',
          agreedPrice: 100,
          paymentStatus: 'PENDING',
          paymentExpiresAt: null,
          currentTransactionId: null,
          startDateTime: new Date('2026-02-20T16:00:00'),
          endDateTime: new Date('2026-02-20T16:30:00'),
          startedAt: null,
          totalElapsedMs: null,
          createdAt: new Date('2026-01-05T09:00:00'),
          updatedAt: new Date('2026-01-05T09:00:00'),
        },
        {
          id: 'apt-carlos-2',
          professionalId: 'prof-3',
          clientId: 'client-carlos',
          modality: 'ONLINE',
          googleMeetLink: null,
          rescheduleDateTime: null,
          status: 'COMPLETED',
          agreedPrice: 90,
          paymentStatus: 'SUCCEEDED',
          paymentExpiresAt: null,
          currentTransactionId: 'txn-300',
          startDateTime: new Date('2026-01-25T11:00:00'),
          endDateTime: new Date('2026-01-25T11:30:00'),
          startedAt: new Date('2026-01-25T11:00:00'),
          totalElapsedMs: 30 * 60 * 1000,
          createdAt: new Date('2026-01-01T09:00:00'),
          updatedAt: new Date('2026-01-25T12:00:00'),
        },
      ],
      isOnline: false,
      isRegistered: true,
      lastActivity: new Date('2026-01-25T12:00:00'),
      createdAt: new Date('2025-11-11T12:00:00'),
    },
  },
  {
    data: {
      name: 'Beatriz Costa',
      email: 'beatriz.costa@example.com',
      phone: '777-888-9999',
      cpf: '999.888.777-66',
      appointments: [],
      isOnline: false,
      isRegistered: false,
      lastActivity: new Date('2026-01-05T10:00:00'),
      createdAt: new Date('2026-01-05T09:00:00'),
    },
  },
  {
    data: {
      name: 'Lucas Almeida',
      email: 'lucas.almeida@example.com',
      phone: '101-202-3030',
      cpf: '101.202.303-00',
      appointments: [],
      isOnline: true,
      isRegistered: true,
      lastActivity: new Date('2026-02-09T08:00:00'),
      createdAt: new Date('2025-12-01T09:00:00'),
    },
  },
  {
    data: {
      name: 'Fernanda Rocha',
      email: 'fernanda.rocha@example.com',
      phone: '202-303-4040',
      cpf: '202.303.404-11',
      appointments: [
        {
          id: 'apt-fernanda-1',
          professionalId: 'prof-4',
          clientId: 'client-fernanda',
          modality: 'ONLINE',
          googleMeetLink: null,
          rescheduleDateTime: null,
          status: 'COMPLETED',
          agreedPrice: 110,
          paymentStatus: 'SUCCEEDED',
          paymentExpiresAt: null,
          currentTransactionId: 'txn-401',
          startDateTime: new Date('2026-01-28T10:00:00'),
          endDateTime: new Date('2026-01-28T10:30:00'),
          startedAt: new Date('2026-01-28T10:00:00'),
          totalElapsedMs: 30 * 60 * 1000,
          createdAt: new Date('2026-01-15T09:00:00'),
          updatedAt: new Date('2026-01-28T11:00:00'),
        },
      ],
      isOnline: false,
      isRegistered: true,
      lastActivity: new Date('2026-01-28T11:00:00'),
      createdAt: new Date('2026-01-15T09:00:00'),
    },
  },
  {
    data: {
      name: 'Rafael Gomes',
      email: 'rafael.gomes@example.com',
      phone: '303-404-5050',
      cpf: '303.404.505-22',
      appointments: [],
      isOnline: false,
      isRegistered: false,
      lastActivity: new Date('2026-01-20T12:00:00'),
      createdAt: new Date('2026-01-20T12:00:00'),
    },
  },
  {
    data: {
      name: 'Juliana Castro',
      email: 'juliana.castro@example.com',
      phone: '404-505-6060',
      cpf: '404.505.606-33',
      appointments: [
        {
          id: 'apt-juliana-1',
          professionalId: 'prof-2',
          clientId: 'client-juliana',
          modality: 'IN_PERSON',
          googleMeetLink: null,
          rescheduleDateTime: null,
          status: 'SCHEDULED',
          agreedPrice: 130,
          paymentStatus: 'PENDING',
          paymentExpiresAt: null,
          currentTransactionId: null,
          startDateTime: new Date('2026-02-18T15:00:00'),
          endDateTime: new Date('2026-02-18T15:30:00'),
          startedAt: null,
          totalElapsedMs: null,
          createdAt: new Date('2026-02-01T09:00:00'),
          updatedAt: new Date('2026-02-01T09:00:00'),
        },
      ],
      isOnline: true,
      isRegistered: true,
      lastActivity: new Date('2026-02-01T09:10:00'),
      createdAt: new Date('2026-02-01T09:00:00'),
    },
  },
  {
    data: {
      name: 'Marcos Vinicius',
      email: 'marcos.v@example.com',
      phone: '505-606-7070',
      cpf: '505.606.707-44',
      appointments: [],
      isOnline: false,
      isRegistered: true,
      lastActivity: new Date('2026-02-02T10:00:00'),
      createdAt: new Date('2026-01-25T08:00:00'),
    },
  },
  {
    data: {
      name: 'Sofia Lima',
      email: 'sofia.lima@example.com',
      phone: '606-707-8080',
      cpf: '606.707.808-55',
      appointments: [
        {
          id: 'apt-sofia-1',
          professionalId: 'prof-5',
          clientId: 'client-sofia',
          modality: 'ONLINE',
          googleMeetLink: 'https://meet.example/sof',
          rescheduleDateTime: null,
          status: 'COMPLETED',
          agreedPrice: 140,
          paymentStatus: 'SUCCEEDED',
          paymentExpiresAt: null,
          currentTransactionId: 'txn-501',
          startDateTime: new Date('2026-02-08T13:00:00'),
          endDateTime: new Date('2026-02-08T13:30:00'),
          startedAt: new Date('2026-02-08T13:00:00'),
          totalElapsedMs: 30 * 60 * 1000,
          createdAt: new Date('2026-01-30T09:00:00'),
          updatedAt: new Date('2026-02-08T14:00:00'),
        },
      ],
      isOnline: true,
      isRegistered: true,
      lastActivity: new Date('2026-02-08T14:05:00'),
      createdAt: new Date('2026-01-30T09:00:00'),
    },
  },
  {
    data: {
      name: 'Thiago Fernandes',
      email: 'thiago.fernandes@example.com',
      phone: '707-808-9090',
      cpf: '707.808.909-66',
      appointments: [],
      isOnline: false,
      isRegistered: false,
      lastActivity: new Date('2026-01-02T11:00:00'),
      createdAt: new Date('2026-01-02T11:00:00'),
    },
  },
  {
    data: {
      name: 'Gabriela Nunes',
      email: 'gabriela.nunes@example.com',
      phone: '808-909-1010',
      cpf: '808.909.101-77',
      appointments: [
        {
          id: 'apt-gabriela-1',
          professionalId: 'prof-6',
          clientId: 'client-gabriela',
          modality: 'IN_PERSON',
          googleMeetLink: null,
          rescheduleDateTime: null,
          status: 'SCHEDULED',
          agreedPrice: 160,
          paymentStatus: 'PENDING',
          paymentExpiresAt: null,
          currentTransactionId: null,
          startDateTime: new Date('2026-02-22T10:00:00'),
          endDateTime: new Date('2026-02-22T10:30:00'),
          startedAt: null,
          totalElapsedMs: null,
          createdAt: new Date('2026-01-10T09:00:00'),
          updatedAt: new Date('2026-01-10T09:00:00'),
        },
      ],
      isOnline: false,
      isRegistered: true,
      lastActivity: new Date('2026-01-10T09:00:00'),
      createdAt: new Date('2026-01-10T09:00:00'),
    },
  },
  {
    data: {
      name: 'Renato Alves',
      email: 'renato.alves@example.com',
      phone: '909-101-1112',
      cpf: '909.101.111-88',
      appointments: [],
      isOnline: true,
      isRegistered: true,
      lastActivity: new Date('2026-02-09T07:30:00'),
      createdAt: new Date('2025-10-10T08:00:00'),
    },
  },
  {
    data: {
      name: 'Paula Miranda',
      email: 'paula.miranda@example.com',
      phone: '111-222-3333',
      cpf: '111.222.333-55',
      appointments: [],
      isOnline: false,
      isRegistered: false,
      lastActivity: new Date('2025-12-31T12:00:00'),
      createdAt: new Date('2025-12-31T12:00:00'),
    },
  },
  {
    data: {
      name: 'Eduardo Martins',
      email: 'eduardo.martins@example.com',
      phone: '222-111-3333',
      cpf: '222.111.333-66',
      appointments: [
        {
          id: 'apt-eduardo-1',
          professionalId: 'prof-7',
          clientId: 'client-eduardo',
          modality: 'IN_PERSON',
          googleMeetLink: null,
          rescheduleDateTime: null,
          status: 'COMPLETED',
          agreedPrice: 180,
          paymentStatus: 'SUCCEEDED',
          paymentExpiresAt: null,
          currentTransactionId: 'txn-701',
          startDateTime: new Date('2026-01-18T09:00:00'),
          endDateTime: new Date('2026-01-18T09:30:00'),
          startedAt: new Date('2026-01-18T09:00:00'),
          totalElapsedMs: 30 * 60 * 1000,
          createdAt: new Date('2026-01-05T09:00:00'),
          updatedAt: new Date('2026-01-18T10:00:00'),
        },
      ],
      isOnline: false,
      isRegistered: true,
      lastActivity: new Date('2026-01-18T10:00:00'),
      createdAt: new Date('2026-01-05T09:00:00'),
    },
  },
  {
    data: {
      name: 'Lívia Ribeiro',
      email: 'livia.ribeiro@example.com',
      phone: '333-444-5555',
      cpf: '333.444.555-77',
      appointments: [],
      isOnline: true,
      isRegistered: true,
      lastActivity: new Date('2026-02-10T10:00:00'),
      createdAt: new Date('2026-02-02T09:00:00'),
    },
  },
  {
    data: {
      name: 'Bruno Carvalho',
      email: 'bruno.carvalho@example.com',
      phone: '444-333-2222',
      cpf: '444.333.222-88',
      appointments: [],
      isOnline: false,
      isRegistered: false,
      lastActivity: new Date('2026-01-03T08:00:00'),
      createdAt: new Date('2026-01-03T08:00:00'),
    },
  },
  {
    data: {
      name: 'Daniela Faria',
      email: 'daniela.faria@example.com',
      phone: '555-222-1111',
      cpf: '555.222.111-99',
      appointments: [],
      isOnline: true,
      isRegistered: true,
      lastActivity: new Date('2026-02-07T16:00:00'),
      createdAt: new Date('2026-01-12T09:00:00'),
    },
  },
  {
    data: {
      name: 'Otávio Lima',
      email: 'otavio.lima@example.com',
      phone: '666-777-8888',
      cpf: '666.777.888-00',
      appointments: [],
      isOnline: false,
      isRegistered: true,
      lastActivity: new Date('2026-01-22T14:00:00'),
      createdAt: new Date('2026-01-22T14:00:00'),
    },
  },
]

type FilterType = 'all' | 'registered' | 'unregistered' | 'online'
type SortType = 'name' | 'recent' | 'appointments'

export function ListClientsPage() {
  const [clients, setClients] = useState([])

  const handleFetchClients = async () => {
    try {
      // Simula uma chamada de API
      const response = await api.get('/contacts/users')

      console.log('Clientes buscados:', response.data)

      setClients(response.data)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    }
  }

  useEffect(() => {
    handleFetchClients()
  }, [])

  const [selectedPatient, setSelectedPatient] =
    useState<ClientCardProps | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortType, setSortType] = useState<SortType>('name')

  const filteredClients = mockClient
    .filter((c) => {
      const q = searchQuery.trim().toLowerCase()
      if (q) {
        const { name, email, phone, cpf } = c.data
        const hay = `${name} ${email} ${phone} ${cpf}`.toLowerCase()
        if (!hay.includes(q)) return false
      }

      if (filterType === 'registered' && !c.data.isRegistered) return false
      if (filterType === 'unregistered' && c.data.isRegistered) return false
      if (filterType === 'online' && !c.data.isOnline) return false

      return true
    })
    .sort((a, b) => {
      if (sortType === 'name')
        return a.data.name.localeCompare(b.data.name, 'pt-BR', {
          sensitivity: 'base',
        })
      if (sortType === 'recent') {
        const ta = a.data.lastActivity
          ? new Date(a.data.lastActivity).getTime()
          : 0
        const tb = b.data.lastActivity
          ? new Date(b.data.lastActivity).getTime()
          : 0
        return tb - ta
      }
      if (sortType === 'appointments')
        return b.data.appointments.length - a.data.appointments.length
      return 0
    })

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
            online: 1,
            registered: 5,
            unregistered: 9,
            total: 14,
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                <SelectItem value="online">Online</SelectItem>
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
        {filteredClients.length} pacientes encontrado
      </p>
      <div
        className="grid gap-4 px-6"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
      >
        {filteredClients.map((client) => (
          <ClientCard key={client.data.cpf} {...client} />
        ))}
      </div>
    </div>
  )
}
