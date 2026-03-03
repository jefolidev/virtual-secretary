import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { User, Users } from 'lucide-react'

import { PersonalNotifications } from './components/personal-notifications'

dayjs.locale('pt-br')

export function NotificationsPage() {
  return (
    <div>
      <div className="flex flex-col justify-center gap-2.5 mb-2 py-6 px-8">
        <div className="">
          <h1 className="text-2xl font-semibold">Centro de notificações</h1>
          <span className="text-sm text-muted-foreground">
            Visualize e gerencie todos os pacientes que já entraram em contato
            com a clínica.
          </span>
        </div>

        <Tabs defaultValue="personal" className="-ml-2">
          <TabsList variant="line">
            <TabsTrigger value="personal">
              <User /> Pessoal
            </TabsTrigger>
            <TabsTrigger value="organization">
              <Users /> Clínica
            </TabsTrigger>
          </TabsList>
          <TabsContent value="personal" className="border-t -mt-1.75">
            <PersonalNotifications />
          </TabsContent>
          <TabsContent value="organization" className="border-t -mt-1.75">
            Em desenvolvimento...
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
