// ============================================================
// TransitOps - Driver Management Page
// Data table with safety scores, license expiry warnings,
// status pills, and toggle buttons.
// TODO (Backend Integration):
//   - GET /api/drivers → populate table
//   - POST /api/drivers → addDriver action
//   - PATCH /api/drivers/:id/status → updateDriverStatus
// ============================================================

import { useState } from 'react';
import { useTransitStore } from '#/store/useTransitStore';
import { Plus, X, AlertTriangle } from 'lucide-react';
import type { Driver, DriverStatus } from '#/types';

// ---- Status pill ----
const DRIVER_STATUS_STYLES: Record<DriverStatus, string> = {
  Available:  'bg-green-500 text-white',
  'On Trip':  'bg-blue-500 text-white',
  'Off Duty': 'bg-slate-600 text-slate-200',
  Suspended:  'bg-red-500 text-white',
};

function DriverStatusPill({ status }: { status: DriverStatus }) {
  return (
    <span className={`px-3 py-1 rounded text-xs font-bold ${DRIVER_STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

// ---- Check license expiry ----
function formatExpiry(expiryDate: string): { text: string; expired: boolean } {
  const d = new Date(expiryDate);
  const expired = d < new Date();
  const text = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  return { text: expired ? `${text} EXPIRED` : text, expired };
}

// ---- Add Driver Modal ----
function AddDriverModal({ onClose }: { onClose: () => void }) {
  const addDriver = useTransitStore(s => s.addDriver);
  const [form, setForm] = useState<Omit<Driver, 'id' | 'status' | 'tripsCompleted'>>({
    name: '',
    licenseNumber: '',
    licenseCategory: 'LMV',
    licenseExpiry: '',
    contactNumber: '',
    safetyScore: 100,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDriver({
      ...form,
      id: `d${Date.now()}`,
      status: 'Available',
      tripsCompleted: 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#161b27] rounded-xl border border-white/10 w-full max-w-md p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">Add New Driver</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name',        key: 'name',           type: 'text',   ph: 'John Doe'          },
            { label: 'License Number',   key: 'licenseNumber',  type: 'text',   ph: 'DL-00000'          },
            { label: 'Contact Number',   key: 'contactNumber',  type: 'text',   ph: '98xxx xxxxx'       },
            { label: 'Safety Score',     key: 'safetyScore',    type: 'number', ph: '100'               },
            { label: 'License Expiry',   key: 'licenseExpiry',  type: 'date',   ph: ''                  },
          ].map(({ label, key, type, ph }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
              <input
                type={type}
                value={String(form[key as keyof typeof form])}
                onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                placeholder={ph}
                required
                className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">License Category</label>
            <select
              value={form.licenseCategory}
              onChange={e => setForm(f => ({ ...f, licenseCategory: e.target.value }))}
              className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
            >
              {['LMV', 'HMV', 'TRANS', 'HTV'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-semibold py-2.5 rounded-md">Cancel</button>
            <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold py-2.5 rounded-md">Add Driver</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Main Page ----
export function DriverManagement() {
  const drivers    = useTransitStore(s => s.drivers);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = drivers.filter(d =>
    search === '' ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.licenseNumber.toLowerCase().includes(search.toLowerCase())
  );

  const STATUS_ORDER: DriverStatus[] = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <input
          type="text"
          placeholder="Search driver or license..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-[#1c2333] border border-white/10 rounded-md px-3 py-1.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 w-56"
        />
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-md text-sm transition-colors"
        >
          <Plus size={15} />
          Add Driver
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#161b27] rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10">
            <tr>
              {['Driver', 'License No.', 'Category', 'Expiry', 'Contact', 'Trip Compl.', 'Safety', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(driver => {
              const { text: expiryText, expired } = formatExpiry(driver.licenseExpiry);
              const blocked = expired || driver.status === 'Suspended';

              return (
                <tr key={driver.id} className={`hover:bg-white/2 transition-colors ${blocked ? 'opacity-75' : ''}`}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{driver.name}</span>
                      {blocked && (
                        <AlertTriangle size={14} className="text-red-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-mono text-xs">{driver.licenseNumber}</td>
                  <td className="px-4 py-3.5 text-slate-300">{driver.licenseCategory}</td>
                  <td className="px-4 py-3.5">
                    <span className={expired ? 'text-red-400 font-semibold text-xs' : 'text-slate-300 text-xs'}>
                      {expiryText}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs">{driver.contactNumber}</td>
                  <td className="px-4 py-3.5 text-slate-300">{driver.tripsCompleted}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${driver.safetyScore >= 90 ? 'bg-green-500' : driver.safetyScore >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${driver.safetyScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-300">{driver.safetyScore}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><DriverStatusPill status={driver.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Toggle status section */}
      <div className="mt-6 bg-[#161b27] rounded-xl border border-white/10 p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Toggle Status</p>
        <div className="flex gap-2 flex-wrap mb-3">
          {STATUS_ORDER.map(s => (
            <span key={s} className={`px-4 py-1.5 rounded text-xs font-bold ${DRIVER_STATUS_STYLES[s]}`}>{s}</span>
          ))}
        </div>
        <p className="text-xs text-red-400/80">
          Rule: Expired license or Suspended status → blocked from trip assignment
        </p>
      </div>

      {showModal && <AddDriverModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
