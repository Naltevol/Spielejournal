import type { CSSProperties } from 'react'
import { getPlayerAvatar } from '../domain/playerAvatar'

type PlayerChipProps = {
  name: string
}

export function PlayerChip({ name }: PlayerChipProps) {
  const avatar = getPlayerAvatar(name)

  return (
    <span className="player-chip" title={name}>
      <span
        aria-hidden="true"
        className="player-chip__avatar"
        style={{ '--player-avatar-color': avatar.color } as CSSProperties}
      >
        {avatar.initials}
      </span>
      <span className="player-chip__name">{name}</span>
    </span>
  )
}
