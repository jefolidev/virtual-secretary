import {
  updateUserAccountSchema,
  type UpdateUserAccountSchema,
} from '@/api/schemas/user-schemas'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/auth-context'
import { useUser } from '@/hooks/use-user'
import { zodResolver } from '@hookform/resolvers/zod'
import { LogOut, Plus, Shield, Trash2, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { SyncButton } from './components/sync-button'

export function AccountSettingsPage() {
  const { updateAccount, loading, clearError } = useUser()
  const { user } = useAuth()
  const [password, setPassword] = useState('')

  const form = useForm<UpdateUserAccountSchema>({
    resolver: zodResolver(updateUserAccountSchema),
    defaultValues: {
      name: user?.name,
      email: user?.email,
      whatsappNumber: user?.whatsappNumber,
    },
  })

  const watchedValues = form.watch()
  const hasChanges =
    watchedValues.name !== (user?.name || '') ||
    watchedValues.email !== (user?.email || '') ||
    watchedValues.whatsappNumber !== (user?.whatsappNumber || '') ||
    (password && password.trim() !== '')

  const handleSave = async (data: UpdateUserAccountSchema) => {
    try {
      clearError()

      const updatedData: UpdateUserAccountSchema = {}

      if (data.name && data.name !== user?.name) updatedData.name = data.name
      if (data.email && data.email !== user?.email)
        updatedData.email = data.email
      if (data.whatsappNumber && data.whatsappNumber !== user?.whatsappNumber)
        updatedData.whatsappNumber = data.whatsappNumber

      await updateAccount(updatedData)

      // Clear password field after successful update
      setPassword('')
    } catch (error) {
      console.error('Erro ao salvar alterações:', error)
    }
  }

  // const handleUploadImage = async (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const file = event.target.files?.[0]
  //   if (file) {
  //     try {
  //       // await uploadImage(file)
  //       console.log('Upload image:', file)
  //     } catch (error) {
  //       console.error('Erro ao fazer upload da imagem:', error)
  //     }
  //   }
  // }

  // const handleDeleteImage = async () => {
  //   try {
  //     // await deleteImage()
  //     console.log('Delete image')
  //   } catch (error) {
  //     console.error('Erro ao remover imagem:', error)
  //   }
  // }

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
          <div
            className="p-10 rounded-full bg-zinc-800 dark:bg-muted/30 bg-cover bg-center"
            style={
              {
                // backgroundImage: user?.profileImage
                //   ? `url(${user.profileImage})`
                //   :
                // undefined,
              }
            }
          >
            {<User className="h-8 w-8 text-white" />}
          </div>
          <div className="flex flex-col">
            <div className="mb-2.5 flex items-center gap-2.5">
              <Button
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Plus className="h-4 w-4" />
                Mudar foto
              </Button>
              {
                <Button
                  variant={'secondary'}
                  // onClick={handleDeleteImage}
                >
                  <Trash2 className="h-4 w-4" />
                  Remover Foto
                </Button>
              }
              <input
                id="image-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                // onChange={handleUploadImage}
                className="hidden"
              />
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-300/60">
              Suportamos PNGs e JPGs até 2MB
            </p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSave)}
            className="space-y-6 mt-8"
          >
            {/* Nome Section */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Pessoais</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Gênero</Label>
                  <Input
                    placeholder="Não informado"
                    value={
                      user?.gender === 'MALE'
                        ? 'Homem'
                        : user?.gender === 'FEMALE'
                          ? 'Mulher'
                          : ''
                    }
                    disabled
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Data de Nascimento</Label>
                  <Input
                    placeholder="Não informado"
                    value={
                      user?.birthDate
                        ? new Date(user.birthDate).toLocaleDateString('pt-BR')
                        : ''
                    }
                    disabled
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Account Security Section */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Segurança da Conta</h3>
                </div>

                <SyncButton user={user!} />
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Digite seu email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="(11) 99999-9999"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>CPF</Label>
                    <Input
                      placeholder="123.456.789-00"
                      value={user?.cpf || ''}
                      disabled
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="password">Nova Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Digite uma nova senha (opcional)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={!hasChanges || loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={!hasChanges}
              >
                Cancelar
              </Button>
            </div>

            <Separator />

            {/* Address Display Section */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Endereço Atual</Label>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                Rua das Flores, 123, Centro - São Paulo/SP
              </p>
            </div>

            <Separator />

            {/* Logout Section */}
            <div className="flex py-3 justify-between items-start">
              <div>
                <h3 className="text-base font-medium mb-1">Encerrar Sessão</h3>
                <p className="text-sm text-muted-foreground">
                  Desconecte-se da sua conta de forma segura. Você precisará
                  fazer login novamente para acessar suas informações.
                </p>
              </div>
              <Button variant="default" className="w-fit">
                <LogOut className="h-4 w-4 mr-2" />
                Sair da Conta
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
