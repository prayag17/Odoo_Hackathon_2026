// ============================================================
// TransitOps - Trip Dispatcher Page
// Split layout: Create Trip form (left) + Live Board (right)
// Business Rules:
//   - Vehicle dropdown: EXCLUDE Retired & In Shop
//   - Driver dropdown: EXCLUDE Suspended & expired license
//   - Cargo weight vs max capacity validation
//   - Dispatch sets vehicle + driver to "On Trip"
// TODO (Backend Integration):
//   - POST /api/trips → addTrip, then POST /api/trips/:id/dispatch
//   - GET /api/trips  → trips live board (poll or WebSocket)
// ============================================================

import { useState, useMemo } from 'react';
import { useTransitStore } from '#/store/useTransitStore';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { Trip, TripStatus } from '#/types';

// ---- Trip status badge ----
const TRIP_STATUS_STYLES: Record<TripStatus, string> = {
  Draft:      'bg-slate-600/50 text-slate-300 border border-slate-600/50',
  Dispatched: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
  Completed:  'bg-green-500/20 text-green-300 border border-green-500/40',
  Cancelled:  'bg-red-500/20 text-red-300 border border-red-500/40',
};

// ---- Trip lifecycle stepper ----

function TripStepper({ status }: { status: TripStatus }) {
  const activeSteps = ['Draft', 'Dispatched', 'Completed'];
  const stepIndex = status === 'Cancelled' ? -1 : activeSteps.indexOf(status);

  return (
    <div className="flex items-center gap-1 mb-5">
      {activeSteps.map((step, i) => {
        const isPast    = i < stepIndex;
        const isCurrent = i === stepIndex;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`
                w-3 h-3 rounded-full border-2 transition-all
                ${isCurrent ? 'bg-amber-500 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                  : isPast ? 'bg-green-500 border-green-500'
                  : 'bg-[#1c2333] border-white/20'}
              `} />
              <span className={`text-[10px] mt-1 ${isCurrent ? 'text-amber-400' : isPast ? 'text-green-400' : 'text-slate-600'}`}>
                {step}
              </span>
            </div>
            {i < activeSteps.length - 1 && (
              <div className={`w-10 h-0.5 mb-4 mx-1 ${isPast ? 'bg-green-500' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
      {/* Cancelled node */}
      <div className="flex items-center ml-1">
        <div className={`w-8 h-0.5 ${status === 'Cancelled' ? 'bg-red-500' : 'bg-white/10'}`} />
        <div className="flex flex-col items-center ml-1">
          <div className={`w-3 h-3 rounded-full border-2 ${status === 'Cancelled' ? 'bg-red-500 border-red-500' : 'bg-[#1c2333] border-white/20'}`} />
          <span className={`text-[10px] mt-1 ${status === 'Cancelled' ? 'text-red-400' : 'text-slate-600'}`}>Cancelled</span>
        </div>
      </div>
    </div>
  );
}

// ---- Complete Trip Modal ----
function CompleteTripModal({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const completeTrip = useTransitStore(s => s.completeTrip);
  const vehicles = useTransitStore(s => s.vehicles);
  const vehicle = vehicles.find(v => v.registrationNumber === trip.vehicleReg);

  const [odometer, setOdometer]   = useState(vehicle?.odometer ?? 0);
  const [liters, setLiters]       = useState(0);
  const [fuelCost, setFuelCost]   = useState(0);

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    completeTrip(trip.id, odometer, liters, fuelCost);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#161b27] rounded-xl border border-white/10 w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-base font-bold text-white mb-4">Complete Trip {trip.id}</h2>
        <form onSubmit={handleComplete} className="space-y-4">
          {[
            { label: 'Final Odometer (km)', val: odometer, set: setOdometer },
            { label: 'Fuel Added (liters)',  val: liters,   set: setLiters   },
            { label: 'Fuel Cost (₹)',        val: fuelCost, set: setFuelCost },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
              <input
                type="number"
                value={val}
                onChange={e => set(Number(e.target.value))}
                className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500/50"
                required
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm py-2.5 rounded-md">Cancel</button>
            <button type="submit" className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2.5 rounded-md">Mark Complete</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Main Page ----
export function TripDispatcher() {
  const vehicles   = useTransitStore(s => s.vehicles);
  const drivers    = useTransitStore(s => s.drivers);
  const trips      = useTransitStore(s => s.trips);
  const addTrip    = useTransitStore(s => s.addTrip);
  const dispatchTrip = useTransitStore(s => s.dispatchTrip);
  const cancelTrip = useTransitStore(s => s.cancelTrip);

  // Eligible vehicles: Available only (no Retired, no In Shop)
  const eligibleVehicles = vehicles.filter(v => v.status === 'Available');

  // Eligible drivers: not Suspended, not expired license
  const eligibleDrivers = drivers.filter(d => {
    const expired = new Date(d.licenseExpiry) < new Date();
    return d.status === 'Available' && !expired;
  });

  const [source,       setSource]       = useState('');
  const [destination,  setDestination]  = useState('');
  const [vehicleReg,   setVehicleReg]   = useState('');
  const [driverId,     setDriverId]     = useState('');
  const [cargoWeight,  setCargoWeight]  = useState(0);
  const [distance,     setDistance]     = useState(0);
  const [dispatchError, setDispatchError] = useState('');
  const [completingTrip, setCompletingTrip] = useState<Trip | null>(null);

  const selectedVehicle = vehicles.find(v => v.registrationNumber === vehicleReg);
  const capacityExceeded = selectedVehicle && cargoWeight > 0 && cargoWeight > selectedVehicle.maxCapacityKg;
  const overBy = selectedVehicle ? cargoWeight - selectedVehicle.maxCapacityKg : 0;

  // Current trip preview for stepper
  const [previewStatus, setPreviewStatus] = useState<TripStatus>('Draft');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setDispatchError('');

    if (capacityExceeded) {
      setDispatchError('Capacity exceeded — dispatch blocked.');
      return;
    }

    const newTripId = `TR${String(Date.now()).slice(-4)}`;
    const newTrip: Trip = {
      id: newTripId,
      source,
      destination,
      vehicleReg,
      driverId,
      cargoWeightKg: cargoWeight,
      distanceKm: distance,
      status: 'Draft',
      etaMinutes: Math.round((distance / 50) * 60),
      createdAt: new Date().toISOString(),
    };

    addTrip(newTrip);
    const result = dispatchTrip(newTripId);
    if (!result.success) {
      setDispatchError(result.error ?? 'Dispatch failed.');
      return;
    }
    setPreviewStatus('Dispatched');
    // Reset form
    setSource(''); setDestination(''); setVehicleReg(''); setDriverId('');
    setCargoWeight(0); setDistance(0);
  };

  // Sort trips: active first
  const sortedTrips = useMemo(() => {
    const order: Record<TripStatus, number> = { Dispatched: 0, Draft: 1, Completed: 2, Cancelled: 3 };
    return [...trips].sort((a, b) => order[a.status] - order[b.status]);
  }, [trips]);

  return (
    <div className="p-6 h-full">
      {/* Stepper at top */}
      <div className="mb-6">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Trip Lifecycle</p>
        <TripStepper status={previewStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* ── Create Trip Form ── */}
        <div className="bg-[#161b27] rounded-xl border border-white/10 p-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Create Trip</h2>

          <form onSubmit={handleCreate} className="space-y-4">
            {/* Source */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Source</label>
              <input
                type="text"
                value={source}
                onChange={e => setSource(e.target.value)}
                placeholder="Gandhinagar Depot"
                required
                className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Destination</label>
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Ahmedabad Hub"
                required
                className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Vehicle dropdown — Available only */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Vehicle (Available Only)
              </label>
              <select
                value={vehicleReg}
                onChange={e => { setVehicleReg(e.target.value); setCargoWeight(0); }}
                required
                className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="">Select vehicle...</option>
                {eligibleVehicles.map(v => (
                  <option key={v.registrationNumber} value={v.registrationNumber}>
                    {v.nameModel} – {v.maxCapacityKg >= 1000 ? `${v.maxCapacityKg / 1000} Ton` : `${v.maxCapacityKg} kg`} capacity
                  </option>
                ))}
              </select>
              {eligibleVehicles.length === 0 && (
                <p className="text-xs text-amber-400/70 mt-1">No available vehicles. Check maintenance or trip status.</p>
              )}
            </div>

            {/* Driver dropdown — Available + valid license */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Driver (Available Only)
              </label>
              <select
                value={driverId}
                onChange={e => setDriverId(e.target.value)}
                required
                className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="">Select driver...</option>
                {eligibleDrivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} (Safety: {d.safetyScore}%)</option>
                ))}
              </select>
              {eligibleDrivers.length === 0 && (
                <p className="text-xs text-amber-400/70 mt-1">No eligible drivers. Check license expiry and suspension status.</p>
              )}
            </div>

            {/* Cargo weight */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Cargo Weight (kg)</label>
              <input
                type="number"
                min={0}
                value={cargoWeight}
                onChange={e => setCargoWeight(Number(e.target.value))}
                className={`w-full bg-[#0f1117] border rounded-md px-3 py-2 text-sm text-white focus:outline-none transition-colors
                  ${capacityExceeded ? 'border-red-500/70 focus:border-red-500' : 'border-white/10 focus:border-amber-500/50'}`}
              />
            </div>

            {/* Capacity exceeded alert */}
            {capacityExceeded && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border-2 border-red-500/50 rounded-lg px-4 py-3">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-red-300">Vehicle Capacity: {selectedVehicle?.maxCapacityKg} kg</p>
                  <p className="text-xs text-red-300">Cargo Weight: {cargoWeight} kg</p>
                  <p className="text-xs text-red-400 font-bold mt-1">✕ Capacity exceeded by {overBy} kg — dispatch blocked</p>
                </div>
              </div>
            )}

            {/* Planned distance */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Planned Distance (km)</label>
              <input
                type="number"
                min={0}
                value={distance}
                onChange={e => setDistance(Number(e.target.value))}
                className="w-full bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* General dispatch error */}
            {dispatchError && !capacityExceeded && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-xs">{dispatchError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={!!capacityExceeded}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-white/10 disabled:text-slate-500 disabled:cursor-not-allowed text-black font-bold py-2.5 rounded-md text-sm transition-colors"
              >
                {capacityExceeded ? 'Dispatch (disabled)' : 'Dispatch Trip'}
              </button>
              <button
                type="button"
                onClick={() => { setSource(''); setDestination(''); setVehicleReg(''); setDriverId(''); setCargoWeight(0); setDistance(0); setDispatchError(''); }}
                className="px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-semibold py-2.5 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          <p className="text-[11px] text-slate-600 mt-4">
            On Complete: odometer → fuel log → expenses → Vehicle & Driver Available
          </p>
        </div>

        {/* ── Live Board ── */}
        <div className="bg-[#161b27] rounded-xl border border-white/10 p-6 overflow-y-auto">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Live Board</h2>
          <div className="space-y-3">
            {sortedTrips.map(trip => {
              const vehicle = vehicles.find(v => v.registrationNumber === trip.vehicleReg);
              const driver  = drivers.find(d => d.id === trip.driverId);
              const etaText = trip.status === 'Dispatched' && trip.etaMinutes
                ? `${trip.etaMinutes} min`
                : trip.status === 'Draft'
                  ? 'Awaiting driver'
                  : trip.status === 'Cancelled'
                    ? 'Vehicle went to shop'
                    : '—';

              return (
                <div key={trip.id} className="bg-[#0f1117] rounded-lg border border-white/5 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-mono text-slate-500 mb-1">{trip.id}</p>
                      <p className="text-sm text-slate-200 font-semibold">
                        {trip.source} → {trip.destination || 'TBD'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        {vehicle ? `${vehicle.nameModel} / ${driver?.name ?? '—'}` : 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${TRIP_STATUS_STYLES[trip.status]}`}>
                      {trip.status}
                    </span>
                    <span className="text-xs text-slate-500">{etaText}</span>
                  </div>
                  {/* Action buttons */}
                  {(trip.status === 'Draft' || trip.status === 'Dispatched') && (
                    <div className="flex gap-2 mt-3">
                      {trip.status === 'Dispatched' && (
                        <button
                          onClick={() => setCompletingTrip(trip)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-600/40 text-green-300 text-xs rounded-md transition-colors"
                        >
                          <CheckCircle size={12} />
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => cancelTrip(trip.id)}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {sortedTrips.length === 0 && (
              <p className="text-slate-600 text-sm text-center py-10">No trips yet. Create one to get started.</p>
            )}
          </div>
        </div>
      </div>

      {/* Complete trip modal */}
      {completingTrip && (
        <CompleteTripModal
          trip={completingTrip}
          onClose={() => setCompletingTrip(null)}
        />
      )}
    </div>
  );
}
