// ============================================================
// TransitOps - Vehicle Registry Page
// Data table with status pills + Add Vehicle modal.
// Business Rule: Registration number must be unique.
// TODO (Backend Integration):
//   - GET /api/vehicles  → populate table
//   - POST /api/vehicles → addVehicle action
// ============================================================

import { useState } from 'react';
import { useTransitStore } from '#/store/useTransitStore';
import { Plus, X, AlertCircle } from 'lucide-react';
import type { Vehicle, VehicleStatus } from '#/types';

// ---- Status pill styles ----
const STATUS_STYLES: Record<VehicleStatus, string> = {
  Available: 'bg-green-500/20 text-green-300 border border-green-500/30',
  'On Trip':  'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  'In Shop':  'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  Retired:   'bg-red-500/20 text-red-300 border border-red-500/30',
};

function StatusPill({ status }: { status: VehicleStatus }) {
  return (
    <span className={`px-2.5 py-1 rounded text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

// ---- Add Vehicle Modal ----
interface AddVehicleModalProps {
  onClose: () => void;
}

function AddVehicleModal({ onClose }: AddVehicleModalProps) {
  const addVehicle = useTransitStore(s => s.addVehicle);
  const [form, setForm] = useState<Omit<Vehicle, 'status'>>({
    registrationNumber: '',
    nameModel: '',
    type: 'Van',
    maxCapacityKg: 500,
    odometer: 0,
    acquisitionCost: 0,
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = addVehicle({ ...form, status: 'Available' });
    if (!result.success) {
      setError(result.error ?? 'Unknown error');
      return;
    }
    onClose();
  };

  const field = (
    label: string,
    key: keyof typeof form,
    type = 'text',
    placeholder = ''
  ) => (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        placeholder={placeholder}
        required
        className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#161b27] rounded-xl border border-white/10 w-full max-w-md p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">Add New Vehicle</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5">
            <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {field('Registration No. (Unique)', 'registrationNumber', 'text', 'GJ01XX000')}
          {field('Name / Model', 'nameModel', 'text', 'VAN-10')}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
            >
              {['Van', 'Truck', 'Mini', 'Bus', 'Pickup'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {field('Max Capacity (kg)', 'maxCapacityKg', 'number', '1000')}
          {field('Odometer (km)',     'odometer',      'number', '0'   )}
          {field('Acquisition Cost', 'acquisitionCost','number', '500000')}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-semibold py-2.5 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold py-2.5 rounded-md transition-colors"
            >
              Add Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Main Page ----
export function VehicleRegistry() {
  const vehicles = useTransitStore(s => s.vehicles);
  const [showModal,    setShowModal]    = useState(false);
  const [filterType,   setFilterType]   = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchReg,    setSearchReg]    = useState('');

  const filtered = vehicles.filter(v => {
    const matchType   = filterType   === 'All' || v.type   === filterType;
    const matchStatus = filterStatus === 'All' || v.status === filterStatus;
    const matchSearch = searchReg === '' || v.registrationNumber.toLowerCase().includes(searchReg.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  return (
    <div className="p-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* Filters */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-[#1c2333] border border-white/10 rounded-md px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-amber-500/50"
          >
            {['All', 'Van', 'Truck', 'Mini', 'Bus', 'Pickup'].map(t => (
              <option key={t} value={t}>Type: {t}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#1c2333] border border-white/10 rounded-md px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-amber-500/50"
          >
            {['All', 'Available', 'On Trip', 'In Shop', 'Retired'].map(s => (
              <option key={s} value={s}>Status: {s}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search reg. no..."
            value={searchReg}
            onChange={e => setSearchReg(e.target.value)}
            className="bg-[#1c2333] border border-white/10 rounded-md px-3 py-1.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 w-44"
          />
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-md text-sm transition-colors"
        >
          <Plus size={15} />
          Add Vehicle
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#161b27] rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10">
            <tr>
              {['Reg. No. (Unique)', 'Name/Model', 'Type', 'Capacity', 'Odometer', 'Acq. Cost', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(v => (
              <tr key={v.registrationNumber} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3.5 text-slate-300 font-mono text-xs">{v.registrationNumber}</td>
                <td className="px-4 py-3.5 text-white font-semibold">{v.nameModel}</td>
                <td className="px-4 py-3.5 text-slate-300">{v.type}</td>
                <td className="px-4 py-3.5 text-slate-300">
                  {v.maxCapacityKg >= 1000
                    ? `${(v.maxCapacityKg / 1000).toFixed(0)} Ton`
                    : `${v.maxCapacityKg} kg`}
                </td>
                <td className="px-4 py-3.5 text-slate-300">{v.odometer.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3.5 text-slate-300">₹{v.acquisitionCost.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3.5"><StatusPill status={v.status} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-600 text-sm">
                  No vehicles match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Business rule note */}
      <p className="text-xs text-amber-500/70 mt-3">
        Rule: Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher
      </p>

      {showModal && <AddVehicleModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
