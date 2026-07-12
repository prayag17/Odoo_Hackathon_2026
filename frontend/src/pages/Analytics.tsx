// ============================================================
// TransitOps - Reports & Analytics Page
// KPI cards: Fuel Efficiency, Fleet Utilization, Op Cost, ROI
// Bar chart: Monthly Revenue
// Top Costliest Vehicles list
// TODO (Backend Integration):
//   - GET /api/analytics/summary → KPIs
//   - GET /api/analytics/monthly-revenue → chart data
//   - GET /api/analytics/vehicle-costs   → costliest vehicles
// ============================================================

import { useTransitStore } from '#/store/useTransitStore';

// Mock monthly revenue data (replace with API data)
// TODO (Backend Integration): fetch from GET /api/analytics/monthly-revenue
const MONTHLY_REVENUE = [
  { month: 'Jan', revenue: 85000  },
  { month: 'Feb', revenue: 92000  },
  { month: 'Mar', revenue: 110000 },
  { month: 'Apr', revenue: 105000 },
  { month: 'May', revenue: 130000 },
  { month: 'Jun', revenue: 120000 },
  { month: 'Jul', revenue: 145000 },
  { month: 'Aug', revenue: 138000 },
];

// ---- KPI Card ----
function AnalyticsKpiCard({
  label,
  value,
  subLabel,
  accent,
}: {
  label: string;
  value: string;
  subLabel?: string;
  accent: string;
}) {
  return (
    <div className={`bg-[#161b27] rounded-xl border ${accent} p-5`}>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
      {subLabel && <p className="text-xs text-slate-500 mt-1">{subLabel}</p>}
    </div>
  );
}

// ---- Simple bar chart (pure CSS/SVG) ----
function BarChart({ data }: { data: { month: string; revenue: number }[] }) {
  const maxVal = Math.max(...data.map(d => d.revenue));

  return (
    <div className="bg-[#161b27] rounded-xl border border-white/10 p-6">
      <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Monthly Revenue</h2>
      <div className="flex items-end gap-2 h-36">
        {data.map(d => {
          const heightPct = (d.revenue / maxVal) * 100;
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-400"
                style={{ height: `${heightPct}%` }}
                title={`₹${d.revenue.toLocaleString('en-IN')}`}
              />
              <span className="text-[10px] text-slate-500">{d.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Top Costliest Vehicles ----
function CostliestVehicles({
  data,
}: {
  data: { name: string; cost: number; maxCost: number; color: string }[];
}) {
  return (
    <div className="bg-[#161b27] rounded-xl border border-white/10 p-6">
      <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Top Costliest Vehicles</h2>
      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm text-slate-400 w-20 flex-shrink-0">{item.name}</span>
            <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.cost / item.maxCost) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
            <span className="text-xs text-slate-300 w-20 text-right">₹{item.cost.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Main Page ----
export function Analytics() {
  const fuelLogs        = useTransitStore(s => s.fuelLogs);
  const maintenanceLogs = useTransitStore(s => s.maintenanceLogs);
  const vehicles        = useTransitStore(s => s.vehicles);
  const trips           = useTransitStore(s => s.trips);

  // ── KPI Calculations ──

  // Fuel efficiency: total km driven / total liters
  const totalLiters = fuelLogs.reduce((s, l) => s + l.liters, 0);
  const completedTrips = trips.filter(t => t.status === 'Completed');
  const totalKm = completedTrips.reduce((s, t) => s + t.distanceKm, 0);
  const fuelEfficiency = totalLiters > 0 ? (totalKm / totalLiters).toFixed(1) : '0.0';

  // Fleet utilization
  const activeVehicles    = vehicles.filter(v => v.status !== 'Retired').length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const fleetUtilization  = activeVehicles > 0
    ? Math.round(((activeVehicles - availableVehicles) / activeVehicles) * 100)
    : 0;

  // Operational cost = all fuel + all maintenance
  const totalFuel  = fuelLogs.reduce((s, l) => s + l.cost, 0);
  const totalMaint = maintenanceLogs.reduce((s, l) => s + l.cost, 0);
  const totalOps   = totalFuel + totalMaint;

  // Vehicle ROI = (Revenue - (Maint + Fuel)) / AcquisitionCost
  // Using mock revenue: total from MONTHLY_REVENUE
  const mockTotalRevenue = MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0);
  const totalAcquisition = vehicles.reduce((s, v) => s + v.acquisitionCost, 0);
  const vehicleROI = totalAcquisition > 0
    ? (((mockTotalRevenue - totalOps) / totalAcquisition) * 100).toFixed(1)
    : '0.0';

  // ── Costliest vehicles ──
  // Per-vehicle maintenance cost
  const vehicleCosts = vehicles
    .filter(v => v.status !== 'Retired')
    .map(v => {
      const maintCost = maintenanceLogs
        .filter(m => m.vehicleReg === v.registrationNumber)
        .reduce((s, m) => s + m.cost, 0);
      const fuelCost = fuelLogs
        .filter(f => f.vehicleReg === v.registrationNumber)
        .reduce((s, f) => s + f.cost, 0);
      return { name: v.nameModel, cost: maintCost + fuelCost };
    })
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5);

  const maxVehicleCost = Math.max(...vehicleCosts.map(v => v.cost), 1);
  const BAR_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];

  const costliestData = vehicleCosts.map((v, i) => ({
    ...v,
    maxCost: maxVehicleCost,
    color: BAR_COLORS[i] ?? '#64748b',
  }));

  return (
    <div className="p-6 space-y-6">
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsKpiCard
          label="Fuel Efficiency"
          value={`${fuelEfficiency} km/l`}
          accent="border-blue-500/20"
        />
        <AnalyticsKpiCard
          label="Fleet Utilization"
          value={`${fleetUtilization}%`}
          accent="border-green-500/20"
        />
        <AnalyticsKpiCard
          label="Operational Cost"
          value={`₹${totalOps.toLocaleString('en-IN')}`}
          accent="border-amber-500/20"
        />
        <AnalyticsKpiCard
          label="Vehicle ROI"
          value={`${vehicleROI}%`}
          subLabel="ROI = (Revenue − (Maint + Fuel)) / Acq. Cost"
          accent="border-green-500/20"
        />
      </div>

      <p className="text-xs text-slate-600">
        ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost
      </p>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BarChart data={MONTHLY_REVENUE} />
        </div>
        <CostliestVehicles data={costliestData} />
      </div>
    </div>
  );
}
