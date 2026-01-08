import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { LogOut, Plus, Shield, Trash2, User } from 'lucide-react'
import { useState } from 'react'

export function AccountSettingsPage() {
  // Initial values
  const initialValues = {
    fullName: 'Dr. João Silva',
    email: 'joao.silva@email.com',
    cpf: '123.456.789-00',
    phone: '(11) 99999-9999',
  }

  const [fullName, setFullName] = useState(initialValues.fullName)
  const [email, setEmail] = useState(initialValues.email)
  const [cpf, setCpf] = useState(initialValues.cpf)
  const [phone, setPhone] = useState(initialValues.phone)
  const [password, setPassword] = useState('')

  // Address is read-only
  const address = 'Rua das Flores, 123, Centro - São Paulo/SP'

  // Check if there are changes
  const hasChanges =
    fullName !== initialValues.fullName ||
    email !== initialValues.email ||
    cpf !== initialValues.cpf ||
    phone !== initialValues.phone ||
    password.trim() !== ''

  const handleSave = () => {
    // Lógica para salvar as informações
    console.log('Salvando:', { fullName, email, cpf, phone })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Configurações da Conta
        </CardTitle>
        <CardDescription>
          Gerencie suas informações pessoais e preferências da conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2.5 items-center">
          <div className="p-10 rounded-full bg-zinc-800 dark:bg-muted/30"></div>
          <div className="flex flex-col">
            <div className="mb-2.5 flex items-center gap-2.5">
              <Button>
                <Plus className="h-4 w-4" />
                Mudar foto
              </Button>
              <Button variant={'secondary'}>
                <Trash2 className="h-4 w-4" />
                Remover Foto
              </Button>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-300/60">
              Suportamos PNGs e JPGs até 2MB{' '}
            </p>
          </div>
        </div>

        <div className="space-y-6 mt-8">
          {/* Nome Section */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Digite seu nome completo"
            />
          </div>

          <Separator />

          {/* Account Security Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Segurança da Conta</h3>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="123.456.789-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Nova Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite uma nova senha (opcional)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={!hasChanges}>
              Salvar Alterações
            </Button>
          </div>
          <Separator />

          {/* Address Display Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Endereço Atual</Label>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              {address}
            </p>
          </div>

          <Separator />

          {/* Logout Section */}
          <div className="flex py-3 justify-between space-y-4">
            <div>
              <h3 className="text-base font-medium mb-1">Encerrar Sessão</h3>
              <p className="text-sm text-muted-foreground">
                Desconecte-se da sua conta de forma segura. Você precisará fazer
                login novamente para acessar suas informações.
              </p>
            </div>
            <Button variant="default" className="w-fit">
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Conta
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
