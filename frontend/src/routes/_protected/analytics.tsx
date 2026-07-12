import { analyticsExportUrl, useAnalytics } from '#/hooks/use-analytics'
import { formatCurrency } from '#/lib/format'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Skeleton } from '#/components/ui/skeleton'
import { createFileRoute } from '@tanstack/react-router'
import { DownloadIcon } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export const Route = createFileRoute('/_protected/analytics')({
  component: RouteComponent,
})

const CHART_TOOLTIP_STYLE = {
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
  background: 'var(--popover)',
  color: 'var(--popover-foreground)',
} as const

function RouteComponent() {
  const { data, isLoading, isError } = useAnalytics()

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {isError && (
        <p className="text-sm text-destructive">Failed to load analytics.</p>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Fuel Efficiency</CardTitle>
              <CardDescription>Kilometers per liter, by vehicle</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} margin={{ left: -20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="registrationNumber"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value) => [`${value} km/L`, 'Fuel Efficiency']}
                  />
                  <Bar dataKey="fuelEfficiency" fill="var(--primary)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operational Cost</CardTitle>
              <CardDescription>Fuel + maintenance spend, by vehicle</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} margin={{ left: -20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="registrationNumber"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value) => [formatCurrency(value as number), 'Operational Cost']}
                  />
                  <Bar dataKey="operationalCost" fill="var(--chart-2, var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Return on Investment</CardTitle>
              <CardDescription>
                (Revenue − operational cost) ÷ acquisition cost, by vehicle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} margin={{ left: -20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="registrationNumber"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    tickFormatter={(value: number) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value) => [`${(Number(value) * 100).toFixed(2)}%`, 'ROI']}
                  />
                  <Bar dataKey="roi" radius={4}>
                    {data.map((row) => (
                      <Cell
                        key={row.vehicleId}
                        fill={row.roi >= 0 ? 'var(--chart-2, #16a34a)' : 'var(--destructive)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Analytics</CardTitle>
          <CardDescription>
            Fuel efficiency, operational cost and ROI per vehicle
          </CardDescription>
          <CardAction>
            <a href={analyticsExportUrl} download>
              <Button variant="outline" size="sm">
                <DownloadIcon data-icon="inline-start" />
                Export CSV
              </Button>
            </a>
          </CardAction>
        </CardHeader>
        <CardContent>
          {isLoading && <Skeleton className="h-64 w-full" />}

          {data && data.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No vehicles yet. Add vehicles under Fleet to see analytics here.
            </p>
          )}

          {data && data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Fuel Efficiency (km/L)</TableHead>
                  <TableHead>Operational Cost</TableHead>
                  <TableHead>ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.vehicleId}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.registrationNumber}</TableCell>
                    <TableCell>{row.fuelEfficiency}</TableCell>
                    <TableCell>{formatCurrency(row.operationalCost)}</TableCell>
                    <TableCell>{(row.roi * 100).toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
