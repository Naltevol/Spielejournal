import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
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

function ChartTooltip({ active, payload, label }: TooltipContentProps<number, string>) {
  if (!active || !payload?.length) return null

  const name = label ?? payload[0].name

  return (
    <div className="chart-tooltip">
      <strong>{name}</strong>
      <span>{payload[0].value} Runden</span>
    </div>
  )
}

export function ChartsPanel({ games, players, results }: ChartsPanelProps) {
  return (
    <div className="charts-grid">
      <Card>
        <CardHeader>
          <CardTitle>Spieleverteilung nach Runden</CardTitle>
        </CardHeader>
        <CardContent className="chart-box">
          {games.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={games} dataKey="value" nameKey="name" outerRadius={88} label>
                  {games.map((entry, index) => (
                    <Cell fill={COLORS[index % COLORS.length]} key={entry.name} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" />
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
          <CardTitle>Runden je Spiel</CardTitle>
        </CardHeader>
        <CardContent className="chart-box">
          {games.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={games} margin={{ bottom: 54, left: 8, right: 12, top: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" interval={0} tickLine={false} axisLine={false} angle={-25} textAnchor="end" height={70} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false}>
                  <Label angle={-90} position="insideLeft" value="Runden" />
                </YAxis>
                <Tooltip content={(props) => <ChartTooltip {...props} />} />
                <Bar dataKey="value" name="Runden" radius={[6, 6, 0, 0]} fill="#7dd3fc" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mitspieler-Verteilung nach Runden</CardTitle>
        </CardHeader>
        <CardContent className="chart-box">
          {players.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={players} margin={{ bottom: 42, left: 8, right: 12, top: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" interval={0} tickLine={false} axisLine={false} angle={-25} textAnchor="end" height={58} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false}>
                  <Label angle={-90} position="insideLeft" value="Mitspieler-Runden" />
                </YAxis>
                <Tooltip content={(props) => <ChartTooltip {...props} />} />
                <Bar dataKey="value" name="Mitspieler-Runden" radius={[6, 6, 0, 0]} fill="#c084fc" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gewonnene und verlorene Runden</CardTitle>
        </CardHeader>
        <CardContent className="chart-box">
          {results.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={results} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} label>
                  {results.map((entry, index) => (
                    <Cell
                      fill={index === 0 ? '#34d399' : '#fb7185'}
                      key={entry.name}
                    />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" />
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

