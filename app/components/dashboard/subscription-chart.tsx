'use client'

interface DataPoint {
  month: string
  amount: number
}

interface SubscriptionChartProps {
  data: DataPoint[]
}

export function SubscriptionChart({ data }: SubscriptionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Monthly Spending</h3>
        <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400">
          No data available
        </div>
      </div>
    )
  }

  const maxAmount = Math.max(...data.map((d) => d.amount))
  const minAmount = Math.min(...data.map((d) => d.amount))
  const range = maxAmount - minAmount || 1

  // Calculate points for the SVG path
  const width = 600
  const height = 200
  const padding = { top: 10, right: 10, bottom: 30, left: 50 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth
    const y = padding.top + chartHeight - ((d.amount - minAmount) / range) * chartHeight
    return { x, y, value: d.amount }
  })

  // Create path for the line
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  // Create gradient fill path
  const fillPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Monthly Spending</h3>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64" preserveAspectRatio="xMidYMid meet">
          {/* Gradient definition */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Y-axis grid lines and labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + chartHeight * (1 - ratio)
            const value = minAmount + range * ratio
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4"
                  className="dark:stroke-slate-700"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-slate-400 dark:fill-slate-500"
                >
                  ${Math.round(value)}
                </text>
              </g>
            )
          })}

          {/* Area fill */}
          <path d={fillPath} fill="url(#chartGradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill="#6366f1" stroke="white" strokeWidth="2" />
              {/* Tooltip on hover */}
              <title>{`${data[i].month}: $${p.value.toFixed(2)}`}</title>
            </g>
          ))}

          {/* X-axis labels */}
          {data.map((d, i) => {
            const x = padding.left + (i / (data.length - 1)) * chartWidth
            return (
              <text
                key={i}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="text-xs fill-slate-500 dark:fill-slate-400"
              >
                {d.month}
              </text>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
