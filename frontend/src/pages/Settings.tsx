// ============================================================
// TransitOps - Settings & RBAC Page
// General config + Role-Based Access Matrix
// TODO (Backend Integration):
//   - GET /api/settings      → load settings
//   - PUT /api/settings      → updateSettings
//   - GET /api/rbac/matrix   → role permissions (currently hardcoded)
// ============================================================

import { useState } from 'react';
import { useTransitStore } from '#/store/useTransitStore';
import { Check, Minus } from 'lucide-react';
import type { Role } from '#/types';

// ---- RBAC Matrix ----
// TODO (Backend Integration): Fetch this from GET /api/rbac/matrix
const MODULES = ['Fleet', 'Drivers', 'Trips', 'Fuel/Exp.', 'Analytics'] as const;
type Module = typeof MODULES[number];
type Permission = 'full' | 'view' | 'none';

const RBAC_MATRIX: Record<Role, Record<Module, Permission>> = {
  'Fleet Manager': {
    Fleet:      'full',
    Drivers:    'full',
    Trips:      'none',
    'Fuel/Exp.':'none',
    Analytics:  'view',
  },
  'Dispatcher': {
    Fleet:      'view',
    Drivers:    'none',
    Trips:      'full',
    'Fuel/Exp.':'none',
    Analytics:  'none',
  },
  'Safety Officer': {
    Fleet:      'none',
    Drivers:    'full',
    Trips:      'view',
    'Fuel/Exp.':'none',
    Analytics:  'none',
  },
  'Financial Analyst': {
    Fleet:      'view',
    Drivers:    'none',
    Trips:      'none',
    'Fuel/Exp.':'full',
    Analytics:  'full',
  },
};

function PermCell({ perm }: { perm: Permission }) {
  if (perm === 'full') return (
    <div className="flex items-center justify-center">
      <Check size={14} className="text-green-400" strokeWidth={2.5} />
    </div>
  );
  if (perm === 'view') return (
    <span className="text-xs text-blue-400 font-semibold">View</span>
  );
  return (
    <div className="flex items-center justify-center">
      <Minus size={12} className="text-slate-600" />
    </div>
  );
}

// ---- Main Page ----
export function Settings() {
  const storeSettings    = useTransitStore(s => s.settings);
  const updateSettings   = useTransitStore(s => s.updateSettings);

  const [depotName,     setDepotName]     = useState(storeSettings.depotName);
  const [currency,      setCurrency]      = useState(storeSettings.currency);
  const [distanceUnit,  setDistanceUnit]  = useState(storeSettings.distanceUnit);
  const [saved,         setSaved]         = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ depotName, currency, distanceUnit });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const ROLES: Role[] = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── General Settings ── */}
        <div className="bg-[#161b27] rounded-xl border border-white/10 p-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">General</h2>

          {saved && (
            <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2.5">
              <p className="text-green-400 text-xs font-semibold">Settings saved successfully.</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Depot Name</label>
              <input
                type="text"
                value={depotName}
                onChange={e => setDepotName(e.target.value)}
                placeholder="Gandhinagar Depot GJ4"
                className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Currency</label>
              <input
                type="text"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                placeholder="INR (Rs.)"
                className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Distance Unit</label>
              <input
                type="text"
                value={distanceUnit}
                onChange={e => setDistanceUnit(e.target.value)}
                placeholder="Kilometers"
                className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-md text-sm transition-colors"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* ── RBAC Matrix ── */}
        <div className="bg-[#161b27] rounded-xl border border-white/10 p-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
            Role-Based Access (RBAC)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pr-4">Role</th>
                  {MODULES.map(m => (
                    <th key={m} className="pb-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ROLES.map(role => (
                  <tr key={role} className="hover:bg-white/2 transition-colors">
                    <td className="py-3.5 pr-4 text-slate-200 text-sm font-semibold">{role}</td>
                    {MODULES.map(m => (
                      <td key={m} className="py-3.5 px-2 text-center">
                        <PermCell perm={RBAC_MATRIX[role][m]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Check size={12} className="text-green-400" />
              <span>Full Access</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-blue-400 font-semibold">View</span>
              <span>Read Only</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Minus size={12} className="text-slate-600" />
              <span>No Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
