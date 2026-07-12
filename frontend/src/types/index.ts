// ============================================================
// TransitOps - TypeScript Data Contracts
// TODO (Backend Integration): Replace these local types with
//   API response types generated from your OpenAPI/GraphQL schema.
// ============================================================

export type Role = 'Fleet Manager' | 'Dispatcher' | 'Safety Officer' | 'Financial Analyst';

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';

export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';

export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

// TODO (Backend Integration): User will be fetched from /api/auth/me after JWT login
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

// TODO (Backend Integration): Vehicles fetched from GET /api/vehicles
export interface Vehicle {
  registrationNumber: string;
  nameModel: string;
  type: string;
  maxCapacityKg: number;
  odometer: number;
  acquisitionCost: number;
  status: VehicleStatus;
}

// TODO (Backend Integration): Drivers fetched from GET /api/drivers
export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string; // ISO date string "YYYY-MM-DD"
  contactNumber: string;
  safetyScore: number;   // 0 - 100
  tripsCompleted: number;
  status: DriverStatus;
}

// TODO (Backend Integration): Trips fetched from GET /api/trips
export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleReg: string;
  driverId: string;
  cargoWeightKg: number;
  distanceKm: number;
  status: TripStatus;
  etaMinutes?: number;
  createdAt: string; // ISO date string
}

// TODO (Backend Integration): Maintenance logs from GET /api/maintenance
export interface MaintenanceLog {
  id: string;
  vehicleReg: string;
  serviceType: string;
  cost: number;
  date: string; // ISO date string
  status: 'Active' | 'Completed';
}

// TODO (Backend Integration): Fuel logs from GET /api/fuel-logs
export interface FuelLog {
  id: string;
  vehicleReg: string;
  date: string; // ISO date string
  liters: number;
  cost: number;
}

// TODO (Backend Integration): Expense logs from GET /api/expenses
export interface ExpenseLog {
  id: string;
  tripId: string;
  vehicleReg: string;
  toll: number;
  other: number;
  maintLinked: number;
  total: number;
}

// Settings stored locally; TODO (Backend Integration): persist via PUT /api/settings
export interface AppSettings {
  depotName: string;
  currency: string;
  distanceUnit: string;
}

// Mock credentials for demo auth
// TODO (Backend Integration): Replace with real POST /api/auth/login call
export interface MockCredential {
  email: string;
  password: string;
  role: Role;
  name: string;
}
