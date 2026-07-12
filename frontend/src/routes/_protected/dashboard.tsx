import { type DashboardKpis, useDashboardKpis } from '#/hooks/use-dashboard'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import { createFileRoute } from '@tanstack/react-router'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'
import {
  ClockIcon,
  GaugeIcon,
  SendIcon,
  TruckIcon,
  UserCheckIcon,
  WrenchIcon,
} from 'lucide-react'

export const Route = createFileRoute('/_protected/dashboard')({
  component: RouteComponent,
})

const KPI_CARDS: {
  key: keyof Omit<DashboardKpis, 'trend'>
  label: string
  suffix?: string
  icon: React.ReactNode
  accent: string
}[] = [
  {
    key: 'activeVehicles',
    label: 'Active Vehicles',
    icon: <TruckIcon className="size-4" />,
    accent: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'availableVehicles',
    label: 'Available Vehicles',
    icon: <TruckIcon className="size-4" />,
    accent: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'vehiclesInMaintenance',
    label: 'In Maintenance',
    icon: <WrenchIcon className="size-4" />,
    accent: 'text-amber-600 dark:text-amber-400',
  },
  {
    key: 'activeTrips',
    label: 'Active Trips',
    icon: <SendIcon className="size-4" />,
    accent: 'text-violet-600 dark:text-violet-400',
  },
  {
    key: 'pendingTrips',
    label: 'Pending Trips',
    icon: <ClockIcon className="size-4" />,
    accent: 'text-orange-600 dark:text-orange-400',
  },
  {
    key: 'driversOnDuty',
    label: 'Drivers On Duty',
    icon: <UserCheckIcon className="size-4" />,
    accent: 'text-teal-600 dark:text-teal-400',
  },
  {
    key: 'fleetUtilization',
    label: 'Fleet Utilization',
    suffix: '%',
    icon: <GaugeIcon className="size-4" />,
    accent: 'text-pink-600 dark:text-pink-400',
  },
]

function RouteComponent() {
  const { data, isLoading, isError } = useDashboardKpis()
  const trendTotal = data?.trend.reduce((sum, d) => sum + d.trips, 0) ?? 0

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {isError && (
            <div className="px-4 text-sm text-destructive lg:px-6">
              Failed to load dashboard data.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-6 @5xl/main:grid-cols-4">
            {isLoading &&
              KPI_CARDS.map((card) => (
                <Card key={card.key} className="@container/card">
                  <CardHeader>
                    <CardDescription className="flex items-center gap-1.5">
                      {card.icon}
                      {card.label}
                    </CardDescription>
                    <Skeleton className="h-8 w-20" />
                  </CardHeader>
                </Card>
              ))}

            {data &&
              KPI_CARDS.map((card) => (
                <Card
                  key={card.key}
                  className="@container/card overflow-hidden"
                >
                  <CardHeader>
                    <CardDescription
                      className={`flex items-center gap-1.5 font-medium ${card.accent}`}
                    >
                      {card.icon}
                      {card.label}
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {data[card.key]}
                      {card.suffix ?? ''}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
          </div>

          <div className="px-4 lg:px-6">
            <Card className="@container/card">
              <CardHeader>
                <CardTitle>Trip Volume</CardTitle>
                <CardDescription>
                  {trendTotal} trip{trendTotal === 1 ? '' : 's'} created over the last 7 days
                </CardDescription>
                <CardAction>
                  <SendIcon className="size-4 text-muted-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                {isLoading ? (
                  <Skeleton className="h-[250px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={data?.trend ?? []}>
                      <defs>
                        <linearGradient id="fillTrips" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value: string) =>
                          new Date(value).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        }
                      />
                      <Tooltip
                        labelFormatter={(label: React.ReactNode) =>
                          new Date(String(label)).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        }
                        contentStyle={{
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--border)',
                          background: 'var(--popover)',
                          color: 'var(--popover-foreground)',
                        }}
                      />
                      <Area
                        dataKey="trips"
                        type="natural"
                        fill="url(#fillTrips)"
                        stroke="var(--primary)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
