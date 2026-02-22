import { MapPin, Video } from 'lucide-react'
import type { AppointmentsSesions } from '../../../..'

function getIconStatusColor(modality: AppointmentsSesions['modality']) {
  if (modality === 'ONLINE') return 'text-blue-500'
  if (modality === 'IN_PERSON') return 'text-purple-500'
  return 'text-gray-500'
}

export function ModalityIcon({
  modality,
}: {
  modality: AppointmentsSesions['modality']
}) {
  return (
    <div className={`p-1.5 rounded-md  ${modality === 'ONLINE' ? 'bg-blue-100 dark:bg-blue-700/10' : 'bg-purple-100 dark:bg-purple-700/10'}`}>
      {modality === 'ONLINE' ? (
        <Video className={`w-4 h-4 ${getIconStatusColor(modality)}`} />
      ) : (
        <MapPin className={`w-4 h-4 ${getIconStatusColor(modality)}`} />
      )}
    </div>
  )
}
