// ============================================================
// TransitOps - Global Zustand State Store
//
// TODO (Backend Integration): Each action that mutates state
//   should call the corresponding REST endpoint and then
//   update local state from the API response.
//   Pattern: optimistic update -> API call -> revert on error
//   Example:
//     async addVehicle(vehicle) {
//       set(state => ({ vehicles: [...state.vehicles, vehicle] }))  // optimistic
//       try { await api.post('/vehicles', vehicle) }
//       catch { set(state => ({ vehicles: state.vehicles.filter(...) })) }
//     }
// ============================================================

import { create } from 'zustand';
import type {
  User,
  Vehicle,
  Driver,
  Trip,
  MaintenanceLog,
  FuelLog,
  ExpenseLog,
  AppSettings,
  MockCredential,
} from '#/types';

// --------------- Mock Credentials (replace with real auth) ---------------
// TODO (Backend Integration): Remove MOCK_CREDENTIALS and call POST /api/auth/login
const MOCK_CREDENTIALS: MockCredential[] = [
  { email: 'manager@transitops.in',  password: 'fleet123',    role: 'Fleet Manager',     name: 'Raven K.' },
  { email: 'dispatch@transitops.in', password: 'dispatch123', role: 'Dispatcher',        name: 'Alex D.' },
  { email: 'safety@transitops.in',   password: 'safety123',   role: 'Safety Officer',    name: 'Priya S.' },
  { email: 'finance@transitops.in',  password: 'finance123',  role: 'Financial Analyst', name: 'John F.' },
];

// --------------- Seed Mock Data ---------------
// TODO (Backend Integration): Remove all seed data below; replace with API fetch calls on app init

const SEED_VEHICLES: Vehicle[] = [
  { registrationNumber: 'GJ01AB452', nameModel: 'VAN-05',    type: 'Van',   maxCapacityKg: 500,  odometer: 74000,  acquisitionCost: 620000, status: 'Available' },
  { registrationNumber: 'GJ01AB998', nameModel: 'TRUCK-11',  type: 'Truck', maxCapacityKg: 5000, odometer: 110000, acquisitionCost: 2450000, status: 'On Trip'  },
  { registrationNumber: 'GJ01AB120', nameModel: 'MINI-03',   type: 'Mini',  maxCapacityKg: 1000, odometer: 66200,  acquisitionCost: 380000, status: 'In Shop'  },
  { registrationNumber: 'GJ01AB008', nameModel: 'VAN-09',    type: 'Van',   maxCapacityKg: 750,  odometer: 241900, acquisitionCost: 590000, status: 'Retired'  },
  { registrationNumber: 'GJ01CD310', nameModel: 'TRUCK-04',  type: 'Truck', maxCapacityKg: 8000, odometer: 55000,  acquisitionCost: 3200000, status: 'Available'},
];

const SEED_DRIVERS: Driver[] = [
  { id: 'd1', name: 'Alex',   licenseNumber: 'DL-88213', licenseCategory: 'LMV', licenseExpiry: '2028-12-31', contactNumber: '98765xxxxx', safetyScore: 96, tripsCompleted: 142, status: 'Available' },
  { id: 'd2', name: 'John',   licenseNumber: 'DL-44120', licenseCategory: 'HMV', licenseExpiry: '2025-03-15', contactNumber: '98220xxxxx', safetyScore: 81, tripsCompleted: 87,  status: 'Suspended' },
  { id: 'd3', name: 'Priya',  licenseNumber: 'DL-77031', licenseCategory: 'LMV', licenseExpiry: '2027-08-20', contactNumber: '99110xxxxx', safetyScore: 99, tripsCompleted: 203, status: 'On Trip'   },
  { id: 'd4', name: 'Suresh', licenseNumber: 'DL-90045', licenseCategory: 'HMV', licenseExpiry: '2027-01-10', contactNumber: '97440xxxxx', safetyScore: 88, tripsCompleted: 64,  status: 'Off Duty'  },
  { id: 'd5', name: 'Meera',  licenseNumber: 'DL-55678', licenseCategory: 'LMV', licenseExpiry: '2029-06-30', contactNumber: '96310xxxxx', safetyScore: 94, tripsCompleted: 119, status: 'Available' },
];

const SEED_TRIPS: Trip[] = [
  { id: 'TR001', source: 'Gandhinagar Depot',        destination: 'Ahmedabad Hub',       vehicleReg: 'GJ01AB998', driverId: 'd3', cargoWeightKg: 2000, distanceKm: 38,  status: 'Dispatched', etaMinutes: 45, createdAt: '2026-07-05T09:00:00Z' },
  { id: 'TR002', source: 'Ahmedabad Hub',             destination: 'Surat Warehouse',     vehicleReg: 'GJ01AB452', driverId: 'd1', cargoWeightKg: 350,  distanceKm: 265, status: 'Completed',  createdAt: '2026-07-04T07:30:00Z' },
  { id: 'TR003', source: 'Gandhinagar Depot',        destination: 'Rajkot Center',       vehicleReg: 'GJ01AB120', driverId: 'd2', cargoWeightKg: 800,  distanceKm: 220, status: 'Dispatched', etaMinutes: 10, createdAt: '2026-07-06T08:00:00Z' },
  { id: 'TR004', source: 'Vatva Industrial Area',    destination: 'Sanand Warehouse',    vehicleReg: 'GJ01CD310', driverId: 'd4', cargoWeightKg: 5000, distanceKm: 55,  status: 'Draft',     createdAt: '2026-07-06T10:00:00Z' },
  { id: 'TR006', source: 'Mansa',                    destination: 'Kalol Depot',         vehicleReg: '',          driverId: '',   cargoWeightKg: 0,    distanceKm: 0,   status: 'Cancelled', createdAt: '2026-07-03T11:00:00Z' },
];

const SEED_MAINTENANCE: MaintenanceLog[] = [
  { id: 'm1', vehicleReg: 'GJ01AB452', serviceType: 'Oil Change',     cost: 2500,  date: '2026-07-01', status: 'Active'    },
  { id: 'm2', vehicleReg: 'GJ01AB998', serviceType: 'Engine Repair',  cost: 18000, date: '2026-06-20', status: 'Completed' },
  { id: 'm3', vehicleReg: 'GJ01AB120', serviceType: 'Tyre Replace',   cost: 6200,  date: '2026-07-05', status: 'Active'    },
];

const SEED_FUEL_LOGS: FuelLog[] = [
  { id: 'f1', vehicleReg: 'GJ01AB452', date: '2026-07-05', liters: 42,  cost: 3150 },
  { id: 'f2', vehicleReg: 'GJ01AB998', date: '2026-07-06', liters: 110, cost: 8400 },
  { id: 'f3', vehicleReg: 'GJ01AB120', date: '2026-07-06', liters: 28,  cost: 2050 },
];

const SEED_EXPENSE_LOGS: ExpenseLog[] = [
  { id: 'e1', tripId: 'TR001', vehicleReg: 'GJ01AB452', toll: 120, other: 0,   maintLinked: 0,     total: 120   },
  { id: 'e2', tripId: 'TR002', vehicleReg: 'GJ01AB998', toll: 340, other: 150, maintLinked: 18000, total: 18490 },
];

// --------------- Store Shape ---------------
interface TransitStore {
  // Auth
  currentUser: User | null;
  loginAttempts: number;
  login: (email: string, password: string, role: string) => boolean;
  logout: () => void;

  // Vehicles
  vehicles: Vehicle[];
  addVehicle: (vehicle: Vehicle) => { success: boolean; error?: string };
  updateVehicleStatus: (reg: string, status: Vehicle['status']) => void;

  // Drivers
  drivers: Driver[];
  addDriver: (driver: Driver) => void;
  updateDriverStatus: (id: string, status: Driver['status']) => void;

  // Trips
  trips: Trip[];
  addTrip: (trip: Trip) => void;
  dispatchTrip: (tripId: string) => { success: boolean; error?: string };
  completeTrip: (tripId: string, finalOdometer: number, fuelLiters: number, fuelCost: number) => void;
  cancelTrip: (tripId: string) => void;

  // Maintenance
  maintenanceLogs: MaintenanceLog[];
  startMaintenance: (vehicleReg: string, serviceType: string, cost: number, date: string) => void;
  closeMaintenance: (logId: string) => void;

  // Fuel & Expenses
  fuelLogs: FuelLog[];
  expenseLogs: ExpenseLog[];
  addFuelLog: (log: FuelLog) => void;
  addExpenseLog: (log: ExpenseLog) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
}

// --------------- Store Implementation ---------------
export const useTransitStore = create<TransitStore>((set, get) => ({
  // ---- Auth ----
  currentUser: null,
  loginAttempts: 0,

  // TODO (Backend Integration): Replace with POST /api/auth/login
  login: (email, password, role) => {
    const match = MOCK_CREDENTIALS.find(
      c => c.email === email && c.password === password && c.role === role
    );
    if (match) {
      set({
        currentUser: { id: `user-${match.role.replace(' ', '-').toLowerCase()}`, email: match.email, name: match.name, role: match.role as User['role'] },
        loginAttempts: 0,
      });
      return true;
    }
    set(state => ({ loginAttempts: state.loginAttempts + 1 }));
    return false;
  },

  // TODO (Backend Integration): Call POST /api/auth/logout and clear JWT
  logout: () => set({ currentUser: null, loginAttempts: 0 }),

  // ---- Vehicles ----
  vehicles: SEED_VEHICLES,

  // TODO (Backend Integration): POST /api/vehicles
  addVehicle: (vehicle) => {
    const exists = get().vehicles.some(v => v.registrationNumber === vehicle.registrationNumber);
    if (exists) return { success: false, error: 'Registration number already exists.' };
    set(state => ({ vehicles: [...state.vehicles, vehicle] }));
    return { success: true };
  },

  // TODO (Backend Integration): PATCH /api/vehicles/:reg/status
  updateVehicleStatus: (reg, status) => {
    set(state => ({
      vehicles: state.vehicles.map(v => v.registrationNumber === reg ? { ...v, status } : v),
    }));
  },

  // ---- Drivers ----
  drivers: SEED_DRIVERS,

  // TODO (Backend Integration): POST /api/drivers
  addDriver: (driver) => {
    set(state => ({ drivers: [...state.drivers, driver] }));
  },

  // TODO (Backend Integration): PATCH /api/drivers/:id/status
  updateDriverStatus: (id, status) => {
    set(state => ({
      drivers: state.drivers.map(d => d.id === id ? { ...d, status } : d),
    }));
  },

  // ---- Trips ----
  trips: SEED_TRIPS,

  // TODO (Backend Integration): POST /api/trips
  addTrip: (trip) => {
    set(state => ({ trips: [...state.trips, trip] }));
  },

  // Business Rule #2: dispatch sets trip + vehicle + driver all to 'On Trip'
  // TODO (Backend Integration): POST /api/trips/:id/dispatch
  dispatchTrip: (tripId) => {
    const trip = get().trips.find(t => t.id === tripId);
    if (!trip) return { success: false, error: 'Trip not found.' };
    if (trip.status !== 'Draft') return { success: false, error: 'Only Draft trips can be dispatched.' };

    set(state => ({
      trips: state.trips.map(t => t.id === tripId ? { ...t, status: 'Dispatched' } : t),
      vehicles: state.vehicles.map(v => v.registrationNumber === trip.vehicleReg ? { ...v, status: 'On Trip' } : v),
      drivers: state.drivers.map(d => d.id === trip.driverId ? { ...d, status: 'On Trip' } : d),
    }));
    return { success: true };
  },

  // Business Rule #3: complete trip, add fuel log, revert vehicle + driver
  // TODO (Backend Integration): POST /api/trips/:id/complete
  completeTrip: (tripId, finalOdometer, fuelLiters, fuelCost) => {
    const trip = get().trips.find(t => t.id === tripId);
    if (!trip) return;

    const newFuelLog: FuelLog = {
      id: `f${Date.now()}`,
      vehicleReg: trip.vehicleReg,
      date: new Date().toISOString().split('T')[0],
      liters: fuelLiters,
      cost: fuelCost,
    };

    set(state => ({
      trips: state.trips.map(t => t.id === tripId ? { ...t, status: 'Completed' } : t),
      vehicles: state.vehicles.map(v =>
        v.registrationNumber === trip.vehicleReg
          ? { ...v, status: 'Available', odometer: finalOdometer }
          : v
      ),
      drivers: state.drivers.map(d =>
        d.id === trip.driverId ? { ...d, status: 'Available', tripsCompleted: d.tripsCompleted + 1 } : d
      ),
      fuelLogs: [...state.fuelLogs, newFuelLog],
    }));
  },

  // Business Rule #4: cancel trip, revert vehicle + driver
  // TODO (Backend Integration): POST /api/trips/:id/cancel
  cancelTrip: (tripId) => {
    const trip = get().trips.find(t => t.id === tripId);
    if (!trip) return;

    set(state => ({
      trips: state.trips.map(t => t.id === tripId ? { ...t, status: 'Cancelled' } : t),
      vehicles: state.vehicles.map(v =>
        v.registrationNumber === trip.vehicleReg && v.status === 'On Trip'
          ? { ...v, status: 'Available' }
          : v
      ),
      drivers: state.drivers.map(d =>
        d.id === trip.driverId && d.status === 'On Trip'
          ? { ...d, status: 'Available' }
          : d
      ),
    }));
  },

  // ---- Maintenance ----
  maintenanceLogs: SEED_MAINTENANCE,

  // Business Rule #5: starts maintenance, sets vehicle to 'In Shop'
  // TODO (Backend Integration): POST /api/maintenance
  startMaintenance: (vehicleReg, serviceType, cost, date) => {
    const newLog: MaintenanceLog = {
      id: `m${Date.now()}`,
      vehicleReg,
      serviceType,
      cost,
      date,
      status: 'Active',
    };
    set(state => ({
      maintenanceLogs: [...state.maintenanceLogs, newLog],
      vehicles: state.vehicles.map(v =>
        v.registrationNumber === vehicleReg ? { ...v, status: 'In Shop' } : v
      ),
    }));
  },

  // Business Rule #6: close maintenance, revert vehicle to Available (unless Retired)
  // TODO (Backend Integration): PATCH /api/maintenance/:id/close
  closeMaintenance: (logId) => {
    const log = get().maintenanceLogs.find(m => m.id === logId);
    if (!log) return;

    set(state => ({
      maintenanceLogs: state.maintenanceLogs.map(m =>
        m.id === logId ? { ...m, status: 'Completed' } : m
      ),
      vehicles: state.vehicles.map(v =>
        v.registrationNumber === log.vehicleReg && v.status !== 'Retired'
          ? { ...v, status: 'Available' }
          : v
      ),
    }));
  },

  // ---- Fuel & Expenses ----
  fuelLogs: SEED_FUEL_LOGS,
  expenseLogs: SEED_EXPENSE_LOGS,

  // TODO (Backend Integration): POST /api/fuel-logs
  addFuelLog: (log) => {
    set(state => ({ fuelLogs: [...state.fuelLogs, log] }));
  },

  // TODO (Backend Integration): POST /api/expenses
  addExpenseLog: (log) => {
    set(state => ({ expenseLogs: [...state.expenseLogs, log] }));
  },

  // ---- Settings ----
  settings: {
    depotName: 'Gandhinagar Depot GJ4',
    currency: 'INR (Rs.)',
    distanceUnit: 'Kilometers',
  },

  // TODO (Backend Integration): PUT /api/settings
  updateSettings: (settings) => {
    set({ settings });
  },
}));
