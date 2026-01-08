import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FileText } from 'lucide-react'

export function ConsultationsSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Consultas
        </CardTitle>
        <CardDescription>
          Configure preferências para agendamentos e consultas.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
