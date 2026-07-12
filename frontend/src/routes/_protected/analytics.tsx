import { analyticsExportUrl, useAnalytics } from '#/hooks/use-analytics'
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

export const Route = createFileRoute('/_protected/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, isError } = useAnalytics()

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
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
          {isError && (
            <p className="text-sm text-destructive">Failed to load analytics.</p>
          )}

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
                    <TableCell>${row.operationalCost.toFixed(2)}</TableCell>
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
