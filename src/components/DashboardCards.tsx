import { Dices, ListOrdered, Percent, Trophy, UsersRound } from 'lucide-react'
import type { AnalyticsSummary } from '../types'
import { Card, CardContent } from './ui/Card'

type DashboardCardsProps = {
  summary: AnalyticsSummary
}

const cards = [
  { key: 'gesamtRunden', label: 'Gespielte Runden', icon: ListOrdered },
  { key: 'unterschiedlicheSpiele', label: 'Unterschiedliche Spiele', icon: Dices },
  { key: 'haeufigstesSpiel', label: 'Häufigstes Spiel', icon: Trophy },
  { key: 'haeufigsterMitspieler', label: 'Meiste Mitspieler-Runden', icon: UsersRound },
  { key: 'gewinnquote', label: 'Gewinnquote', icon: Percent },
] as const

export function DashboardCards({ summary }: DashboardCardsProps) {
  return (
    <div className="metric-grid">
      {cards.map((card) => {
        const Icon = card.icon
        const rawValue = summary[card.key]
        const value = card.key === 'gewinnquote' ? `${rawValue}%` : rawValue

        return (
          <Card className="metric-card" key={card.key}>
            <CardContent>
              <div className="metric-card__top">
                <span>{card.label}</span>
                <span className="metric-card__icon">
                  <Icon aria-hidden="true" />
                </span>
              </div>
              <strong>{value}</strong>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
