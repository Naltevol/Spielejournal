import { Trophy, Users, Dice5, Hash, TrendingUp } from 'lucide-react'
import type { AnalyticsSummary } from '../types'
import { Card, CardContent } from './ui/Card'

type DashboardCardsProps = {
  summary: AnalyticsSummary
}

const cards = [
  { key: 'gesamtRunden', label: 'Gespielte Runden', icon: Hash },
  { key: 'unterschiedlicheSpiele', label: 'Unterschiedliche Spiele', icon: Dice5 },
  { key: 'haeufigstesSpiel', label: 'Häufigstes Spiel', icon: Trophy },
  { key: 'haeufigsterMitspieler', label: 'Häufigster Mitspieler', icon: Users },
  { key: 'gewinnquote', label: 'Gewinnquote', icon: TrendingUp },
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
                <Icon aria-hidden="true" />
              </div>
              <strong>{value}</strong>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
