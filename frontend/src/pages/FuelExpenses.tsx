// ============================================================
// TransitOps - Fuel & Expense Management Page
// Two sections: Fuel Logs + Operational Cost summary
// TODO (Backend Integration):
//   - GET /api/fuel-logs   → fuelLogs
//   - POST /api/fuel-logs  → addFuelLog
//   - GET /api/expenses    → expenseLogs
//   - POST /api/expenses   → addExpenseLog
// ============================================================

import { useState } from 'react';
import { useTransitStore } from '#/store/useTransitStore';
import { Plus, X } from 'lucide-react';
import type { FuelLog, ExpenseLog } from '#/types';

// ---- Log Fuel Modal ----
function LogFuelModal({ onClose }: { onClose: () => void }) {
  const vehicles  = useTransitStore(s => s.vehicles);
  const addFuelLog = useTransitStore(s => s.addFuelLog);

  const [vehicleReg, setVehicleReg] = useState('');
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [liters, setLiters]   = useState(0);
  const [cost, setCost]       = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const log: FuelLog = {
      id: `f${Date.now()}`,
      vehicleReg,
      date,
      liters,
      cost,
    };
    addFuelLog(log);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#161b27] rounded-xl border border-white/10 w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">Log Fuel Entry</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Vehicle</label>
            <select
              value={vehicleReg}
              onChange={e => setVehicleReg(e.target.value)}
              required
              className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
            >
              <option value="">Select vehicle...</option>
              {vehicles.map(v => <option key={v.registrationNumber} value={v.registrationNumber}>{v.nameModel}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required
              className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Liters</label>
            <input type="number" min={0} value={liters} onChange={e => setLiters(Number(e.target.value))} required
              className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Fuel Cost (₹)</label>
            <input type="number" min={0} value={cost} onChange={e => setCost(Number(e.target.value))} required
              className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm py-2.5 rounded-md">Cancel</button>
            <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold py-2.5 rounded-md">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Add Expense Modal ----
function AddExpenseModal({ onClose }: { onClose: () => void }) {
  const vehicles     = useTransitStore(s => s.vehicles);
  const trips        = useTransitStore(s => s.trips);
  const addExpenseLog = useTransitStore(s => s.addExpenseLog);

  const [tripId,      setTripId]      = useState('');
  const [vehicleReg,  setVehicleReg]  = useState('');
  const [toll,        setToll]        = useState(0);
  const [other,       setOther]       = useState(0);
  const [maintLinked, setMaintLinked] = useState(0);

  const total = toll + other + maintLinked;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const log: ExpenseLog = {
      id: `e${Date.now()}`,
      tripId,
      vehicleReg,
      toll,
      other,
      maintLinked,
      total,
    };
    addExpenseLog(log);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#161b27] rounded-xl border border-white/10 w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">Add Expense Entry</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Trip</label>
            <select value={tripId} onChange={e => setTripId(e.target.value)} required
              className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50">
              <option value="">Select trip...</option>
              {trips.map(t => <option key={t.id} value={t.id}>{t.id} — {t.source} → {t.destination}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Vehicle</label>
            <select value={vehicleReg} onChange={e => setVehicleReg(e.target.value)} required
              className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50">
              <option value="">Select vehicle...</option>
              {vehicles.map(v => <option key={v.registrationNumber} value={v.registrationNumber}>{v.nameModel}</option>)}
            </select>
          </div>
          {[
            { label: 'Toll (₹)',              val: toll,        set: setToll        },
            { label: 'Other (₹)',             val: other,       set: setOther       },
            { label: 'Maintenance Linked (₹)',val: maintLinked, set: setMaintLinked },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
              <input type="number" min={0} value={val} onChange={e => set(Number(e.target.value))}
                className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
            </div>
          ))}
          <div className="bg-white/5 rounded-md px-3 py-2 flex justify-between items-center">
            <span className="text-xs text-slate-400">Total</span>
            <span className="text-amber-400 font-bold">₹{total.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm py-2.5 rounded-md">Cancel</button>
            <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold py-2.5 rounded-md">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Main Page ----
export function FuelExpenses() {
  const fuelLogs      = useTransitStore(s => s.fuelLogs);
  const expenseLogs   = useTransitStore(s => s.expenseLogs);
  const maintenanceLogs = useTransitStore(s => s.maintenanceLogs);
  const trips         = useTransitStore(s => s.trips);
  const vehicles      = useTransitStore(s => s.vehicles);

  const [showFuelModal,    setShowFuelModal]    = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Total operational cost = all fuel + all maintenance
  const totalFuel  = fuelLogs.reduce((sum, l) => sum + l.cost, 0);
  const totalMaint = maintenanceLogs.reduce((sum, l) => sum + l.cost, 0);
  const totalOps   = totalFuel + totalMaint;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 space-y-6">
      {/* ── Header Actions ── */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => setShowFuelModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-md text-sm transition-colors"
        >
          <Plus size={15} /> Log Fuel
        </button>
        <button
          onClick={() => setShowExpenseModal(true)}
          className="flex items-center gap-2 bg-[#1c2333] hover:bg-[#252d40] border border-white/10 text-slate-200 font-semibold px-4 py-2 rounded-md text-sm transition-colors"
        >
          <Plus size={15} /> Add Expense
        </button>
      </div>

      {/* ── Fuel Logs Table ── */}
      <div className="bg-[#161b27] rounded-xl border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Fuel Logs</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-white/10">
            <tr>
              {['Vehicle', 'Date', 'Liters', 'Fuel Cost'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {fuelLogs.map(log => {
              const vehicle = vehicles.find(v => v.registrationNumber === log.vehicleReg);
              return (
                <tr key={log.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5 text-white font-semibold">{vehicle?.nameModel ?? log.vehicleReg}</td>
                  <td className="px-5 py-3.5 text-slate-300">{formatDate(log.date)}</td>
                  <td className="px-5 py-3.5 text-slate-300">{log.liters} L</td>
                  <td className="px-5 py-3.5 text-slate-300">₹{log.cost.toLocaleString('en-IN')}</td>
                </tr>
              );
            })}
            {fuelLogs.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-600 text-sm">No fuel logs yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Operational Cost Table ── */}
      <div className="bg-[#161b27] rounded-xl border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Operational Cost (Toll / Misc)
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-white/10">
            <tr>
              {['Trip', 'Vehicle', 'Toll', 'Other', 'Maint. (Linked)', 'Total'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {expenseLogs.map(log => {
              const vehicle = vehicles.find(v => v.registrationNumber === log.vehicleReg);
              const trip = trips.find(t => t.id === log.tripId);
              const statusStyle = trip?.status === 'Completed'
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
              return (
                <tr key={log.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5 text-slate-300 font-mono text-xs">{log.tripId}</td>
                  <td className="px-5 py-3.5 text-white font-semibold">{vehicle?.nameModel ?? log.vehicleReg}</td>
                  <td className="px-5 py-3.5 text-slate-300">₹{log.toll.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3.5 text-slate-300">₹{log.other.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3.5 text-slate-300">₹{log.maintLinked.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${statusStyle}`}>
                      ₹{log.total.toLocaleString('en-IN')}
                    </span>
                  </td>
                </tr>
              );
            })}
            {expenseLogs.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-600 text-sm">No expense logs yet.</td></tr>
            )}
          </tbody>
        </table>

        {/* Total */}
        <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Total Operational Cost (Auto) = Fuel + Maint.
          </p>
          <span className="text-amber-400 font-bold text-base">₹{totalOps.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {showFuelModal    && <LogFuelModal    onClose={() => setShowFuelModal(false)}    />}
      {showExpenseModal && <AddExpenseModal onClose={() => setShowExpenseModal(false)} />}
    </div>
  );
}
