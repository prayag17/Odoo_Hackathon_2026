// ============================================================
// TransitOps - Maintenance Log Page
// Left: "Log Service Record" form
// Right: Service Log history table
// Business Rules:
//   - startMaintenance sets vehicle to "In Shop"
//   - closeMaintenance sets vehicle back to "Available" (unless Retired)
// TODO (Backend Integration):
//   - GET /api/maintenance  → populate table
//   - POST /api/maintenance → startMaintenance
//   - PATCH /api/maintenance/:id/close → closeMaintenance
// ============================================================

import { useState } from 'react';
import { useTransitStore } from '#/store/useTransitStore';
import { ArrowRight } from 'lucide-react';
import type { MaintenanceLog } from '#/types';

const LOG_STATUS_STYLES: Record<MaintenanceLog['status'], string> = {
  Active:    'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  Completed: 'bg-green-500/20 text-green-300 border border-green-500/30',
};

function LogStatusPill({ status }: { status: MaintenanceLog['status'] }) {
  return (
    <span className={`px-2.5 py-1 rounded text-xs font-bold ${LOG_STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

export function Maintenance() {
  const vehicles         = useTransitStore(s => s.vehicles);
  const maintenanceLogs  = useTransitStore(s => s.maintenanceLogs);
  const startMaintenance = useTransitStore(s => s.startMaintenance);
  const closeMaintenance = useTransitStore(s => s.closeMaintenance);

  // Only allow logging maintenance on non-Retired vehicles
  const eligibleVehicles = vehicles.filter(v => v.status !== 'On Trip');

  const [vehicleReg,   setVehicleReg]   = useState('');
  const [serviceType,  setServiceType]  = useState('');
  const [cost,         setCost]         = useState(0);
  const [date,         setDate]         = useState(new Date().toISOString().split('T')[0]);
  const [successMsg,   setSuccessMsg]   = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startMaintenance(vehicleReg, serviceType, cost, date);
    setSuccessMsg(`Service record logged for ${vehicleReg}.`);
    setVehicleReg(''); setServiceType(''); setCost(0);
    setDate(new Date().toISOString().split('T')[0]);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const selectedVehicleModel = vehicles.find(v => v.registrationNumber === vehicleReg)?.nameModel ?? '';

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Log Service Record Form ── */}
        <div className="bg-[#161b27] rounded-xl border border-white/10 p-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Log Service Record</h2>

          {successMsg && (
            <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2.5">
              <p className="text-green-400 text-xs font-semibold">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            {/* Vehicle selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Vehicle</label>
              <select
                value={vehicleReg}
                onChange={e => setVehicleReg(e.target.value)}
                required
                className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="">Select vehicle...</option>
                {eligibleVehicles.map(v => (
                  <option key={v.registrationNumber} value={v.registrationNumber}>
                    {v.nameModel} ({v.registrationNumber}) — {v.status}
                  </option>
                ))}
              </select>
              {selectedVehicleModel && (
                <p className="text-xs text-slate-500 mt-1">{selectedVehicleModel}</p>
              )}
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Service Type</label>
              <input
                type="text"
                value={serviceType}
                onChange={e => setServiceType(e.target.value)}
                placeholder="Oil Change"
                required
                className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Cost */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Cost (₹)</label>
              <input
                type="number"
                min={0}
                value={cost}
                onChange={e => setCost(Number(e.target.value))}
                placeholder="2500"
                required
                className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Status (readonly) */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
              <input
                type="text"
                value="Active"
                readOnly
                className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded-md text-sm transition-colors mt-2"
            >
              Save
            </button>
          </form>

          {/* Status flow diagram */}
          <div className="mt-6 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-semibold w-20">Available</span>
              <div className="flex-1 border-t border-dashed border-white/20" />
              <ArrowRight size={12} className="text-slate-500" />
              <span className="text-amber-400 font-semibold w-16 text-right">In Shop</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-semibold w-20">In Shop</span>
              <div className="flex-1 border-t border-dashed border-white/20" />
              <ArrowRight size={12} className="text-slate-500" />
              <span className="text-green-400 font-semibold w-16 text-right">Available</span>
            </div>
            <p className="text-amber-500/70 mt-1">Note: In Shop vehicles are removed from the dispatch pool.</p>
          </div>
        </div>

        {/* ── Service Log Table ── */}
        <div className="bg-[#161b27] rounded-xl border border-white/10 p-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Service Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr>
                  {['Vehicle', 'Service', 'Cost', 'Date', 'Status', ''].map(h => (
                    <th key={h} className="pb-3 text-left text-xs text-slate-500 uppercase tracking-wider font-semibold pr-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {maintenanceLogs.map(log => {
                  const vehicle = vehicles.find(v => v.registrationNumber === log.vehicleReg);
                  return (
                    <tr key={log.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-3.5 pr-3 text-white font-semibold">{vehicle?.nameModel ?? log.vehicleReg}</td>
                      <td className="py-3.5 pr-3 text-slate-300">{log.serviceType}</td>
                      <td className="py-3.5 pr-3 text-slate-300">₹{log.cost.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 pr-3 text-slate-400 text-xs">{log.date}</td>
                      <td className="py-3.5 pr-3"><LogStatusPill status={log.status} /></td>
                      <td className="py-3.5">
                        {log.status === 'Active' && (
                          <button
                            onClick={() => closeMaintenance(log.id)}
                            className="text-xs px-2.5 py-1 bg-green-600/20 hover:bg-green-600/30 border border-green-600/40 text-green-300 rounded-md transition-colors"
                          >
                            Close
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {maintenanceLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-600 text-sm">No maintenance records yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
