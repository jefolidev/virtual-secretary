import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AddressDetails() {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="cep">CEP</Label>
        <Input id="cep" placeholder="00000-000" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="street">Rua</Label>
        <Input id="street" placeholder="Nome da rua" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input id="neighborhood" placeholder="Bairro" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="number">Número</Label>
          <Input id="number" placeholder="123" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="complement">Complemento</Label>
        <Input id="complement" placeholder="Apto, bloco, etc" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" placeholder="Cidade" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="state">Estado</Label>
          <Input id="state" placeholder="UF" maxLength={2} />
        </div>
      </div>
    </div>
  )
}
