import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AccountDetails() {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" placeholder="Seu nome completo" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="seu@email.com" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" placeholder="••••••••" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input id="confirmPassword" type="password" placeholder="••••••••" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" placeholder="(00) 00000-0000" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cpf">CPF</Label>
        <Input id="cpf" placeholder="000.000.000-00" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="birthdate">Data de nascimento</Label>
        <Input id="birthdate" type="date" />
      </div>
    </div>
  )
}
