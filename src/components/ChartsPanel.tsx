import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipContentProps } from 'recharts'
import type { NamedCount } from '../types'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'

type ChartLimit = 5 | 10 | 'all'

type ChartsPanelProps = {
  games: NamedCount[]
  players: NamedCount[]
  results: NamedCount[]
}

type RankedChartProps = {
  accent?: 'primary' | 'secondary'
  className?: string
  data: NamedCount[]
  emptyLabel?: string
  limit: ChartLimit
  title: string
}

type RankedDatum = NamedCount & {
  label: string
}

const ACCENT_COLORS = {
  primary: '#7dd3fc',
  secondary: '#c084fc',
} as const

const RESULT_COLORS = ['#34d399', '#fb7185']
const CHART_MARGIN = { bottom: 8, left: 8, right: 42, top: 10 }
const BAR_ROW_HEIGHT = 42

function EmptyChart({ label = 'Keine Daten für diesen Filter' }: { label?: string }) {
  return <div className="empty-chart">{label}</div>
}

function truncateLabel(name: string) {
  if (name.length <= 24) return name
  return name.slice(0, 21).trimEnd() + '...'
}

function getLimitedData(data: NamedCount[], limit: ChartLimit) {
  if (limit === 'all') return data
  return data.slice(0, limit)
}

function withDisplayLabels(data: NamedCount[]): RankedDatum[] {
  return data.map((entry) => ({
    ...entry,
    label: truncateLabel(entry.name),
  }))
}

function ChartTooltip({ active, payload, label }: TooltipContentProps<number, string>) {
  if (!active || !payload?.length) return null

  const payloadEntry = payload[0].payload as Partial<NamedCount> | undefined
  const name = payloadEntry?.name ?? label ?? payload[0].name

  return (
    <div className="chart-tooltip">
      <strong>{name}</strong>
      <span>{payload[0].value} Runden</span>
    </div>
  )
}

function LimitControl({ limit, onLimitChange }: {
  limit: ChartLimit
  onLimitChange: (limit: ChartLimit) => void
}) {
  const options: Array<{ label: string; value: ChartLimit }> = [
    { label: 'Top 5', value: 5 },
    { label: 'Top 10', value: 10 },
    { label: 'Alle', value: 'all' },
  ]

  return (
    <div className="chart-limit-control" aria-label="Chart-Anzahl wählen">
      {options.map((option) => (
        <Button
          aria-pressed={limit === option.value}
          className="chart-limit-control__button"
          key={option.label}
          onClick={() => onLimitChange(option.value)}
          variant={limit === option.value ? 'default' : 'ghost'}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}

function RankedBarChart({
  accent = 'primary',
  className,
  data,
  emptyLabel,
  limit,
  title,
}: RankedChartProps) {
  const visibleData = useMemo(
    () => withDisplayLabels(getLimitedData(data, limit)),
    [data, limit],
  )
  const chartHeight = Math.max(260, visibleData.length * BAR_ROW_HEIGHT + 34)
  const isScrollable = limit === 'all' && visibleData.length > 10

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="chart-box chart-box--ranked">
        {visibleData.length ? (
          <div className={isScrollable ? 'chart-scroll' : undefined}>
            <div className="ranked-chart" style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={visibleData}
                  layout="vertical"
                  margin={CHART_MARGIN}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.07)" horizontal={false} />
                  <XAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#a7b0bf', fontSize: 12 }}
                    type="number"
                  />
                  <YAxis
                    axisLine={false}
                    dataKey="label"
                    interval={0}
                    tickLine={false}
                    tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 700 }}
                    type="category"
                    width={132}
                  />
                  <Tooltip content={(props) => <ChartTooltip {...props} />} cursor={{ fill: 'rgba(255,255,255,0.035)' }} />
                  <Bar
                    dataKey="value"
                    fill={ACCENT_COLORS[accent]}
                    name="Runden"
                    radius={[0, 6, 6, 0]}
                  >
                    <LabelList
                      dataKey="value"
                      fill="#f4f7fb"
                      fontSize={12}
                      fontWeight={800}
                      position="right"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <EmptyChart label={emptyLabel} />
        )}
      </CardContent>
    </Card>
  )
}

function ResultsDonut({ results }: { results: NamedCount[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gewonnene und verlorene Runden</CardTitle>
      </CardHeader>
      <CardContent className="chart-box chart-box--donut">
        {results.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={results}
                dataKey="value"
                innerRadius={62}
                nameKey="name"
                outerRadius={92}
                paddingAngle={3}
              >
                {results.map((entry, index) => (
                  <Cell fill={RESULT_COLORS[index % RESULT_COLORS.length]} key={entry.name} />
                ))}
                <LabelList
                  dataKey="value"
                  fill="#f4f7fb"
                  fontSize={13}
                  fontWeight={800}
                  position="outside"
                />
              </Pie>
              <Tooltip content={(props) => <ChartTooltip {...props} />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
        {results.length ? (
          <div className="result-legend" aria-label="Legende Gewinnstatus">
            {results.map((entry, index) => (
              <span key={entry.name}>
                <i style={{ background: RESULT_COLORS[index % RESULT_COLORS.length] }} />
                {entry.name}: {entry.value}
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function ChartsPanel({ games, players, results }: ChartsPanelProps) {
  const [limit, setLimit] = useState<ChartLimit>(10)

  return (
    <div className="dashboard-charts">
      <div className="dashboard-charts__toolbar">
        <div>
          <h3>Ranglisten</h3>
          <p>Spiele und Mitspieler nach gespielten Runden.</p>
        </div>
        <LimitControl limit={limit} onLimitChange={setLimit} />
      </div>

      <div className="charts-grid">
        <RankedBarChart
          className="chart-card--wide"
          data={games}
          limit={limit}
          title={limit === 'all' ? 'Spiele nach Runden' : `Top ${limit} Spiele nach Runden`}
        />

        <RankedBarChart
          accent="secondary"
          data={players}
          emptyLabel="Keine Mitspieler für diesen Filter"
          limit={limit}
          title={limit === 'all' ? 'Mitspieler nach Runden' : `Top ${limit} Mitspieler nach Runden`}
        />

        <ResultsDonut results={results} />
      </div>
    </div>
  )
}
