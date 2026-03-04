import {
  appointmentsServices,
  type EvaluationStatsResponse,
} from '@/api/endpoints/appointments'
import type { FetchProfessionalSchedulesResponse } from '@/api/endpoints/appointments/dto'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/hooks/use-theme'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { AlertCircle, Star, Target, TrendingUp, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface RecentEvaluation {
  id: string
  session: string
  score: number
  comment: string | null
  date: string
  clientName: string
}

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 9
      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
      : score >= 7
        ? 'bg-slate-600 dark:bg-slate-300 text-white dark:text-slate-900'
        : 'bg-slate-400 dark:bg-slate-600 text-white dark:text-slate-100'

  return (
    <Badge
      className={`size-9 rounded-md text-sm font-semibold border-transparent ${cls}`}
    >
      {score}
    </Badge>
  )
}

const columns: ColumnDef<RecentEvaluation>[] = [
  {
    accessorKey: 'score',
    header: 'Nota',
    cell: ({ row }) => <ScoreBadge score={row.original.score} />,
  },
  {
    accessorKey: 'clientName',
    header: 'Paciente',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.clientName}</span>
    ),
  },
  {
    accessorKey: 'session',
    header: 'Sessão',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.session}</span>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Data',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {new Date(row.original.date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </span>
    ),
  },
  {
    accessorKey: 'comment',
    header: 'Comentário',
    cell: ({ row }) =>
      row.original.comment ? (
        <span className="text-muted-foreground max-w-sm truncate block">
          {row.original.comment}
        </span>
      ) : (
        <span className="text-muted-foreground/50 italic">Sem comentário</span>
      ),
  },
]

export function SatisfactionAnalytics() {
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  const [dateFrom, setDateFrom] = useState(formatDate(firstDayOfMonth))
  const [dateTo, setDateTo] = useState(formatDate(today))
  const [minScore, setMinScore] = useState('0')

  const [stats, setStats] = useState<EvaluationStatsResponse['stats'] | null>(
    null,
  )
  const [recentEvaluations, setRecentEvaluations] = useState<
    RecentEvaluation[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()
  const { theme } = useTheme()
  const darkMode = theme === 'dark'

  const fetchData = useCallback(async () => {
    if (!user?.professional_id) return

    setLoading(true)
    setError(null)

    try {
      const [statsResult, appointmentsResult] = await Promise.allSettled([
        appointmentsServices.getEvaluationStats(user.professional_id, {
          from: dateFrom,
          to: dateTo,
          minScore: parseInt(minScore),
        }),
        appointmentsServices.fetchAppointmentsByProfessional(
          user.professional_id,
          1,
          {
            period: 'all',
            status: 'COMPLETED',
            paymentStatus: 'all',
            modality: 'all',
          },
        ),
      ])

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value.stats)
      } else {
        setStats(null)
      }

      if (appointmentsResult.status === 'fulfilled') {
        const withEvaluations = appointmentsResult.value.appointments
          .filter(
            (a: FetchProfessionalSchedulesResponse) =>
              a.appointment.evaluation != null,
          )
          .slice(0, 10)
          .map((a: FetchProfessionalSchedulesResponse, idx: number) => ({
            id: a.appointment.evaluation!.id,
            session: `Sessão #${String(idx + 1).padStart(4, '0')}`,
            score: a.appointment.evaluation!.score,
            comment: a.appointment.evaluation!.comment,
            date: new Date(a.appointment.evaluation!.createdAt).toISOString(),
            clientName: a.name,
          }))
        setRecentEvaluations(withEvaluations)
      }
    } catch {
      setError('Erro ao carregar dados de satisfação')
    } finally {
      setLoading(false)
    }
  }, [user?.professional_id, dateFrom, dateTo, minScore])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const scoreDistribution = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => ({
        score: i,
        count: stats?.distribution?.[i] ?? 0,
      })),
    [stats],
  )

  const promoters = stats?.promoters ?? 0
  const passives = stats?.passives ?? 0
  const detractors = stats?.detractors ?? 0
  const total = promoters + passives + detractors || 1

  const getBarColor = (score: number) => {
    if (score >= 9) return darkMode ? '#e2e8f0' : '#334155'
    if (score >= 7) return darkMode ? '#94a3b8' : '#64748b'
    return darkMode ? '#475569' : '#94a3b8'
  }

  const table = useReactTable({
    data: recentEvaluations,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-3  items-center mb-2 py-6 border-b px-8">
        <div className="col-span-2">
          <h1 className="text-2xl font-semibold">Relatório de satisfação</h1>
          <span className="text-sm text-muted-foreground">
            Visualize as avaliações recebidas dos pacientes e acompanhe a
            evolução da satisfação ao longo do tempo.
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col justify-start items-start gap-3">
          <div className="flex gap-2.5">
            <div className="flex items-center gap-2 rounded-md border border-input bg-card px-3 h-9">
              <Label
                htmlFor="date-from"
                className="text-xs text-muted-foreground font-normal shrink-0"
              >
                De
              </Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border-0 shadow-none h-auto text-xs focus-visible:ring-0 p-0 w-[130px] bg-transparent"
              />
            </div>

            <div className="flex items-center gap-2 rounded-md border border-input bg-card px-3 h-9">
              <Label
                htmlFor="date-to"
                className="text-xs text-muted-foreground font-normal shrink-0"
              >
                Até
              </Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border-0 shadow-none h-auto text-xs focus-visible:ring-0 p-0 flex-1 bg-transparent"
              />
            </div>
          </div>

          <Select value={minScore} onValueChange={setMinScore}>
            <SelectTrigger size="default" className="w-full text-xs ">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <SelectItem key={n} value={String(n)} className="text-xs">
                  Nota {n}+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Total
              </CardTitle>
              <CardAction>
                <Users className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-12 w-20 mb-2" />
              ) : (
                <p className="text-5xl font-semibold text-foreground mb-1">
                  {stats?.total ?? 0}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Avaliações recebidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Média
              </CardTitle>
              <CardAction>
                <Star className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-12 w-20 mb-2" />
              ) : (
                <p className="text-5xl font-semibold text-foreground mb-1">
                  {(stats?.averageScore ?? 0).toFixed(1)}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Nota média geral</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Mediana
              </CardTitle>
              <CardAction>
                <Target className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-12 w-20 mb-2" />
              ) : (
                <p className="text-5xl font-semibold text-foreground mb-1">
                  {stats?.median ?? 0}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Valor central</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                NPS
              </CardTitle>
              <CardAction>
                <TrendingUp className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-12 w-20 mb-2" />
              ) : (
                <p className="text-5xl font-semibold text-foreground mb-1">
                  {(stats?.nps ?? 0) >= 0 ? '+' : ''}
                  {stats?.nps ?? 0}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Net Promoter Score
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Score Distribution */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Distribuição de Notas</CardTitle>
              <CardDescription>
                Frequência de cada nota de 0 a 10
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[280px] flex items-center justify-center">
                  <div className="size-8 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? '#1e293b' : '#f1f5f9'}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="score"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#0f172a' : 'white',
                        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        padding: '8px 12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                        color: darkMode ? '#f1f5f9' : '#0f172a',
                      }}
                      cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {scoreDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getBarColor(entry.score)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* NPS Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>NPS</CardTitle>
              <CardDescription>Distribuição por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Promotores</span>
                      <span className="text-xs font-semibold">{promoters}</span>
                    </div>
                    <Progress value={(promoters / total) * 100} />
                    <p className="text-[10px] text-muted-foreground">
                      Notas 9-10 • {((promoters / total) * 100).toFixed(0)}%
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Passivos</span>
                      <span className="text-xs font-semibold">{passives}</span>
                    </div>
                    <Progress
                      value={(passives / total) * 100}
                      className="[&_[data-slot=progress-indicator]]:bg-primary/60"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Notas 7-8 • {((passives / total) * 100).toFixed(0)}%
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Detratores</span>
                      <span className="text-xs font-semibold">
                        {detractors}
                      </span>
                    </div>
                    <Progress
                      value={(detractors / total) * 100}
                      className="[&_[data-slot=progress-indicator]]:bg-primary/30"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Notas 0-6 • {((detractors / total) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Evaluations — Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Avaliações Recentes</CardTitle>
            <CardDescription>
              Últimas avaliações recebidas de pacientes
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="px-6">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="px-6">
                        <Skeleton className="size-9 rounded-md" />
                      </TableCell>
                      <TableCell className="px-6">
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell className="px-6">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="px-6">
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell className="px-6">
                        <Skeleton className="h-4 w-56" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="px-6 py-12 text-center text-sm text-muted-foreground"
                    >
                      Nenhuma avaliação encontrada para o período selecionado.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-6 py-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
