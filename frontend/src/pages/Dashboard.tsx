// ============================================================
// TransitOps - Dashboard Page
// KPI cards + Recent Trips table + Vehicle Status bar chart
// TODO (Backend Integration): Replace store selectors with
//   API data fetched via React Query or SWR hooks:
//   useQuery({ queryKey: ['dashboard'], queryFn: () => api.get('/dashboard/summary') })
// ============================================================

import { useTransitStore } from '#/store/useTransitStore';
import { useState } from 'react';
import { Truck, Users, Activity, Clock, Wrench, TrendingUp } from 'lucide-react';

// ---- Status badge helper ----
const TRIP_STATUS_STYLES: Record<string, string> = {
  Dispatched: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  Completed:  'bg-green-500/20 text-green-300 border border-green-500/30',
  Draft:      'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  Cancelled:  'bg-red-500/20 text-red-300 border border-red-500/30',
};

function TripStatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2.5 py-1 rounded text-xs font-semibold ${TRIP_STATUS_STYLES[status] ?? 'bg-slate-700 text-slate-300'}`}>
      {status}
    </span>
  );
}

// ---- KPI Card ----
interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
}
function KpiCard({ label, value, icon, accent = 'border-white/10' }: KpiCardProps) {
  return (
    <div className={`bg-[#161b27] rounded-xl border ${accent} p-4 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{label}</span>
        <span className="text-slate-500">{icon}</span>
      </div>
      <span className="text-3xl font-bold text-white">{value}</span>
    </div>
  );
}

// ---- Vehicle Status Bar ----
function VehicleStatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-400 w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm text-slate-300 w-6 text-right">{count}</span>
    </div>
  );
}

export function Dashboard() {
  const vehicles = useTransitStore(s => s.vehicles);
  const drivers  = useTransitStore(s => s.drivers);
  const trips    = useTransitStore(s => s.trips);

  // TODO (Backend Integration): Replace filter options with data from GET /api/vehicle-types and /api/regions
  const [filterType,   setFilterType]   = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');

  // Computed KPIs
  const activeVehicles    = vehicles.filter(v => v.status !== 'Retired').length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const inMaintenance     = vehicles.filter(v => v.status === 'In Shop').length;
  const activeTrips       = trips.filter(t => t.status === 'Dispatched').length;
  const pendingTrips      = trips.filter(t => t.status === 'Draft').length;
  const driversOnDuty     = drivers.filter(d => d.status === 'On Trip' || d.status === 'Available').length;
  const fleetUtilization  = activeVehicles > 0
    ? Math.round(((activeVehicles - availableVehicles) / activeVehicles) * 100)
    : 0;

  // Vehicle status counts for bar chart
  const vcAvailable = vehicles.filter(v => v.status === 'Available').length;
  const vcOnTrip    = vehicles.filter(v => v.status === 'On Trip').length;
  const vcInShop    = vehicles.filter(v => v.status === 'In Shop').length;
  const vcRetired   = vehicles.filter(v => v.status === 'Retired').length;
  const vcTotal     = vehicles.length;

  // Recent trips — latest 8
  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="p-6 space-y-6">
      {/* ── Filters ── */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filters</span>
        {/* TODO (Backend Integration): Populate filter options from API */}
        {[
          { label: 'Vehicle Type', value: filterType,   set: setFilterType,   options: ['All', 'Van', 'Truck', 'Mini'] },
          { label: 'Status',       value: filterStatus, set: setFilterStatus, options: ['All', 'Available', 'On Trip', 'In Shop', 'Retired'] },
          { label: 'Region',       value: filterRegion, set: setFilterRegion, options: ['All', 'Ahmedabad', 'Gandhinagar', 'Surat', 'Rajkot'] },
        ].map(f => (
          <select
            key={f.label}
            value={f.value}
            onChange={e => f.set(e.target.value)}
            className="bg-[#1c2333] border border-white/10 rounded-md px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-amber-500/50 transition-colors"
          >
            {f.options.map(o => (
              <option key={o} value={o}>{f.label}: {o}</option>
            ))}
          </select>
        ))}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <KpiCard label="Active Vehicles"         value={activeVehicles}    icon={<Truck size={16} />}    accent="border-white/10" />
        <KpiCard label="Available Vehicles"      value={availableVehicles} icon={<Truck size={16} />}    accent="border-green-500/20" />
        <KpiCard label="Vehicles in Maintenance" value={inMaintenance}     icon={<Wrench size={16} />}   accent="border-amber-500/20" />
        <KpiCard label="Active Trips"            value={activeTrips}       icon={<Activity size={16} />} accent="border-blue-500/20" />
        <KpiCard label="Pending Trips"           value={pendingTrips}      icon={<Clock size={16} />}    accent="border-white/10" />
        <KpiCard label="Drivers on Duty"         value={driversOnDuty}     icon={<Users size={16} />}    accent="border-white/10" />
        <KpiCard label="Fleet Utilization"       value={`${fleetUtilization}%`} icon={<TrendingUp size={16} />} accent="border-green-500/20" />
      </div>

      {/* ── Two-column lower grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips table */}
        <div className="lg:col-span-2 bg-[#161b27] rounded-xl border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Recent Trips</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-white/10">
                  {['Trip', 'Vehicle', 'Driver', 'Status', 'ETA'].map(h => (
                    <th key={h} className="pb-3 text-xs text-slate-500 uppercase tracking-wider font-semibold pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentTrips.map(trip => {
                  const driver  = useTransitStore.getState().drivers.find(d => d.id === trip.driverId);
                  const vehicle = useTransitStore.getState().vehicles.find(v => v.registrationNumber === trip.vehicleReg);
                  const etaText = trip.status === 'Dispatched' && trip.etaMinutes
                    ? `${trip.etaMinutes} min`
                    : trip.status === 'Draft'
                      ? 'Awaiting vehicle'
                      : '—';

                  return (
                    <tr key={trip.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-3 pr-4 text-slate-300 font-mono text-xs">{trip.id}</td>
                      <td className="py-3 pr-4 text-slate-300">{vehicle?.nameModel ?? '—'}</td>
                      <td className="py-3 pr-4 text-slate-300">{driver?.name ?? '—'}</td>
                      <td className="py-3 pr-4"><TripStatusBadge status={trip.status} /></td>
                      <td className="py-3 text-slate-400 text-xs">{etaText}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status bar chart */}
        <div className="bg-[#161b27] rounded-xl border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Vehicle Status</h2>
          <div className="space-y-4">
            <VehicleStatusBar label="Available" count={vcAvailable} total={vcTotal} color="bg-green-500" />
            <VehicleStatusBar label="On Trip"   count={vcOnTrip}    total={vcTotal} color="bg-blue-500"  />
            <VehicleStatusBar label="In Shop"   count={vcInShop}    total={vcTotal} color="bg-amber-500" />
            <VehicleStatusBar label="Retired"   count={vcRetired}   total={vcTotal} color="bg-red-500"   />
          </div>
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-slate-500">Total fleet: <span className="text-white font-semibold">{vcTotal}</span></p>
            <p className="text-xs text-slate-500 mt-1">
              Utilization: <span className="text-amber-400 font-semibold">{fleetUtilization}%</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
