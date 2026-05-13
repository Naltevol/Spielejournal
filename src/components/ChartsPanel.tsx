import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipContentProps } from 'recharts'
import type { NamedCount } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'

const COLORS = ['#7dd3fc', '#c084fc', '#facc15', '#34d399', '#fb7185', '#a3e635']

type ChartsPanelProps = {
  games: NamedCount[]
  players: NamedCount[]
  results: NamedCount[]
}

function EmptyChart() {
  return <div className="empty-chart">Keine Daten für diesen Filter</div>
}

function ChartTooltip({ active, payload }: TooltipContentProps<number, string>) {
  if (!active || !payload?.length) return null

  return (
    <div className="chart-tooltip">
      <strong>{payload[0].name}</strong>
      <span>{payload[0].value} Runden</span>
    </div>
  )
}

export function ChartsPanel({ games, players, results }: ChartsPanelProps) {
  return (
    <div className="charts-grid">
      <Card>
        <CardHeader>
          <CardTitle>Verteilung der Spiele</CardTitle>
        </CardHeader>
        <CardContent className="chart-box">
          {games.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={games} dataKey="value" nameKey="name" outerRadius={92} label>
                  {games.map((entry, index) => (
                    <Cell fill={COLORS[index % COLORS.length]} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip content={(props) => <ChartTooltip {...props} />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Häufigkeit je Spiel</CardTitle>
        </CardHeader>
        <CardContent className="chart-box">
          {games.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={games} margin={{ left: -16, right: 8 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={(props) => <ChartTooltip {...props} />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#7dd3fc" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Häufigkeit je Mitspieler</CardTitle>
        </CardHeader>
        <CardContent className="chart-box">
          {players.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={players} margin={{ left: -16, right: 8 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={(props) => <ChartTooltip {...props} />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#c084fc" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gewonnen vs. verloren</CardTitle>
        </CardHeader>
        <CardContent className="chart-box">
          {results.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={results} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} label>
                  {results.map((entry, index) => (
                    <Cell
                      fill={index === 0 ? '#34d399' : '#fb7185'}
                      key={entry.name}
                    />
                  ))}
                </Pie>
                <Tooltip content={(props) => <ChartTooltip {...props} />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
