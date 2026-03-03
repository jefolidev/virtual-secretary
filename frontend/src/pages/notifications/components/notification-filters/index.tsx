import type { NotificationType } from '@/api/endpoints/notifications/dto'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from '@/components/ui/field'

interface NotificationFiltersProps {
  types: NotificationType[]
  labels: Record<string, string>
  selectedTypes: Set<NotificationType>
  onToggle: (type: NotificationType) => void
}

export function NotificationFilters({
  types,
  labels,
  selectedTypes,
  onToggle,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-col p-12 col-span-1">
      <div className="flex flex-col gap-2.5">
        <FieldSet>
          <FieldLegend variant="label" className="font-bold">
            Tipos
          </FieldLegend>
          <FieldDescription>
            Selecione o tipo de notificações que deseja ver.
          </FieldDescription>
          <FieldGroup className="gap-3 -mt-1.5">
            {types.map((type) => (
              <Field key={type} orientation="horizontal">
                <Checkbox
                  checked={selectedTypes.has(type)}
                  onCheckedChange={() => onToggle(type)}
                />
                <FieldLabel className="font-normal">{labels[type]}</FieldLabel>
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
      </div>
    </div>
  )
}
