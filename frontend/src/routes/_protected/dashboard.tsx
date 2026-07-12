import { type DashboardKpis, useDashboardKpis } from '#/hooks/use-dashboard'
import {
  Card,
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

export const Route = createFileRoute('/_protected/dashboard')({
  component: RouteComponent,
})

const KPI_CARDS: {
  key: keyof Omit<DashboardKpis, 'trend'>
  label: string
  suffix?: string
}[] = [
  { key: 'activeVehicles', label: 'Active Vehicles' },
  { key: 'availableVehicles', label: 'Available Vehicles' },
  { key: 'vehiclesInMaintenance', label: 'Vehicles in Maintenance' },
  { key: 'activeTrips', label: 'Active Trips' },
  { key: 'pendingTrips', label: 'Pending Trips' },
  { key: 'driversOnDuty', label: 'Drivers On Duty' },
  { key: 'fleetUtilization', label: 'Fleet Utilization', suffix: '%' },
]

function RouteComponent() {
  const { data, isLoading, isError } = useDashboardKpis()

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {isError && (
            <div className="px-4 text-sm text-destructive lg:px-6">
              Failed to load dashboard data.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
            {isLoading &&
              KPI_CARDS.map((card) => (
                <Card key={card.key} className="@container/card">
                  <CardHeader>
                    <CardDescription>{card.label}</CardDescription>
                    <Skeleton className="h-8 w-20" />
                  </CardHeader>
                </Card>
              ))}

            {data &&
              KPI_CARDS.map((card) => (
                <Card key={card.key} className="@container/card">
                  <CardHeader>
                    <CardDescription>{card.label}</CardDescription>
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
                <CardDescription>Trips created over the last 7 days</CardDescription>
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
                      <CartesianGrid vertical={false} />
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
                      />
                      <Area
                        dataKey="trips"
                        type="natural"
                        fill="url(#fillTrips)"
                        stroke="var(--primary)"
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
