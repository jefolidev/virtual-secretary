interface ControlBarProps {
  stats: {
    total: number
    registered: number
    unregistered: number
    online: number
  }
}

export function ControlBar({ stats }: ControlBarProps) {
  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="text-right">
        <p className="text-muted-foreground">Total</p>
        <p className="text-xl font-medium text-accent-foreground ">
          {stats.total}
        </p>
      </div>
      <div className="h-10 w-px bg-gray-200" />
      <div className="text-right">
        <p className="text-muted-foreground">Cadastrados</p>
        <p className="text-xl font-medium  text-accent-foreground">
          {stats.registered}
        </p>
      </div>
      <div className="h-10 w-px bg-gray-200" />
      <div className="text-right">
        <p className="text-muted-foreground">Pendentes</p>
        <p className="text-xl font-medium text-accent-foreground">
          {stats.unregistered}
        </p>
      </div>
      <div className="h-10 w-px bg-gray-200" />
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="flex gap-2.5 items-center">
            <div className="size-2 rounded-full bg-green-500" />
            <p className="text-muted-foreground">Online</p>
          </div>
          <p className="text-xl font-medium text-accent-foreground">
            {stats.online}
          </p>
        </div>
      </div>
    </div>
  )
}
