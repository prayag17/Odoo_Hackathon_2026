// ============================================================
// TransitOps - Login Page
// Split-screen: dark branding left, login form right.
// TODO (Backend Integration):
//   - Replace mock login with POST /api/auth/login
//   - Store returned JWT in httpOnly cookie or localStorage
//   - Redirect based on role permissions
// ============================================================

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTransitStore } from '#/store/useTransitStore';
import { Truck, AlertCircle } from 'lucide-react';
import type { Role } from '#/types';

const ROLES: Role[] = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];

const ROLE_ACCESS: Record<Role, string> = {
  'Fleet Manager':     'Fleet, Maintenance',
  'Dispatcher':        'Dashboard, Trips',
  'Safety Officer':    'Drivers, Compliance',
  'Financial Analyst': 'Fuel & Expenses, Analytics',
};

// Demo hint credentials
const DEMO_CREDS: Record<Role, { email: string; password: string }> = {
  'Fleet Manager':     { email: 'manager@transitops.in',  password: 'fleet123'    },
  'Dispatcher':        { email: 'dispatch@transitops.in', password: 'dispatch123' },
  'Safety Officer':    { email: 'safety@transitops.in',   password: 'safety123'   },
  'Financial Analyst': { email: 'finance@transitops.in',  password: 'finance123'  },
};

export function Login() {
  const login = useTransitStore(s => s.login);
  const loginAttempts = useTransitStore(s => s.loginAttempts);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Dispatcher');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (r: Role) => {
    setRole(r);
    // Auto-fill demo credentials when role changes for convenience
    setEmail(DEMO_CREDS[r].email);
    setPassword(DEMO_CREDS[r].password);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // TODO (Backend Integration): Replace with API call
    //   const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role }) })
    setTimeout(() => {
      const success = login(email, password, role);
      setLoading(false);
      if (success) {
        void navigate({ to: '/dashboard' });
      } else {
        const attempts = loginAttempts + 1;
        if (attempts >= 5) {
          setError('Account locked after 5 failed attempts. Contact your administrator.');
        } else {
          setError(`Invalid credentials. ${5 - attempts} attempt(s) remaining before lockout.`);
        }
      }
    }, 400);
  };

  return (
    <div className="flex h-screen bg-[#0f1117]">
      {/* ── Left Panel ── */}
      <div className="w-[42%] bg-[#161b27] flex flex-col justify-between p-10 border-r border-white/10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
            <Truck size={20} className="text-black" />
          </div>
          <div>
            <div className="text-white font-bold text-xl leading-tight">TransitOps</div>
            <div className="text-slate-400 text-xs">Smart Transport Operations Platform</div>
          </div>
        </div>

        {/* Roles info */}
        <div className="space-y-6">
          <div>
            <p className="text-slate-300 text-sm mb-4">One login, four roles:</p>
            <div className="space-y-2">
              {ROLES.map(r => (
                <div key={r} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-slate-200 text-sm">{r}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2">
            <p className="text-xs text-slate-500 mb-2">Access is scoped by role after login</p>
            {ROLES.map(r => (
              <div key={r} className="text-xs text-slate-400">
                <span className="text-slate-300">• {r}</span>
                <span className="text-slate-500"> → {ROLE_ACCESS[r]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-slate-600 uppercase tracking-widest">
          TransitOps © 2026 · RBAC Engine
        </p>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center bg-[#0f1117] p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Sign in to your account</h1>
            <p className="text-slate-400 text-sm mt-1">Enter your credentials to continue</p>
          </div>

          {/* Error box */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 bg-red-500/10 border border-red-500/40 rounded-lg px-4 py-3">
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-400 text-xs font-semibold">Invalid credentials.</p>
                <p className="text-red-300/80 text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Raven.k@transitops.in"
                required
                className="w-full bg-[#1c2333] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#1c2333] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Role (RBAC)</label>
              <select
                value={role}
                onChange={e => handleRoleChange(e.target.value as Role)}
                className="w-full bg-[#1c2333] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/60 transition-colors"
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 accent-amber-500"
                />
                <span className="text-xs text-slate-400">Remember me</span>
              </label>
              <button type="button" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || loginAttempts >= 5}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/40 disabled:cursor-not-allowed text-black font-bold py-2.5 rounded-md text-sm transition-colors mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo hint */}
          <p className="text-[11px] text-slate-600 mt-6 text-center">
            Select a role above — demo credentials auto-fill.
          </p>
        </div>
      </div>
    </div>
  );
}
