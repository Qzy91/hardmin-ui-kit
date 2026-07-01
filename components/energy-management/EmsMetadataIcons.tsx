import { Brain, Camera, FileCog, FileText, Unplug, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EmsNodeMetadata } from './types'

interface Props {
  metadata?: EmsNodeMetadata
}

interface MetaIconProps {
  icon: React.ReactNode
  color: string
  badge?: number
  show: boolean
}

function MetaIcon({ icon, color, badge, show }: MetaIconProps) {
  if (!show) return null
  return (
    <div className="relative flex h-5 w-5 items-center justify-center" style={{ color }}>
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-main_color px-0.5 text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
    </div>
  )
}

export function EmsMetadataIcons({ metadata }: Props) {
  if (!metadata) return null

  return (
    <div className={cn('flex items-center justify-center gap-1.5')}>
      <MetaIcon
        icon={<Camera className="h-4 w-4" />}
        color="#6b7280"
        badge={metadata.photosCount}
        show={(metadata.photosCount ?? 0) > 0}
      />
      <MetaIcon
        icon={<User className="h-4 w-4" />}
        color="#ef4444"
        badge={metadata.contactsCount}
        show={(metadata.contactsCount ?? 0) > 0}
      />
      <MetaIcon
        icon={<Unplug className="h-4 w-4" />}
        color="#0ea5e9"
        show={!!metadata.hasDistribution}
      />
      <MetaIcon
        icon={<FileCog className="h-4 w-4" />}
        color="#0ea5e9"
        show={!!metadata.hasContracts}
      />
      <MetaIcon
        icon={<FileText className="h-4 w-4" />}
        color="#c084fc"
        show={!!metadata.hasDocuments}
      />
      <MetaIcon
        icon={<Brain className="h-4 w-4" />}
        color="#a855f7"
        show={!!metadata.hasAi}
      />
    </div>
  )
}
