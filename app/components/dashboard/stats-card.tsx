interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'indigo' | 'green' | 'amber' | 'red'
}

export function StatsCard({ title, value, description, icon, trend, color = 'indigo' }: StatsCardProps) {
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
          {description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {trend.isPositive ? '+' : '-'}{trend.value}%
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
