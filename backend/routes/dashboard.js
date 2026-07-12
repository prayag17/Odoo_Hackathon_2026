import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/dashboard/kpis
router.get("/kpis", async (req, res) => {
  try {
    const [vehicleCounts, tripCounts, driverCounts, trend] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status <> 'Retired') AS active_vehicles,
          COUNT(*) FILTER (WHERE status = 'Available') AS available_vehicles,
          COUNT(*) FILTER (WHERE status = 'In Shop') AS vehicles_in_maintenance,
          COUNT(*) FILTER (WHERE status = 'On Trip') AS vehicles_on_trip,
          COUNT(*) AS total_vehicles
        FROM vehicles
      `),
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'Dispatched') AS active_trips,
          COUNT(*) FILTER (WHERE status = 'Draft') AS pending_trips
        FROM trips
      `),
      pool.query(`
        SELECT COUNT(*) FILTER (WHERE status = 'On Trip') AS drivers_on_duty
        FROM drivers
      `),
      pool.query(`
        SELECT
          to_char(day, 'YYYY-MM-DD') AS date,
          COUNT(t.id) AS trips
        FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS day
        LEFT JOIN trips t ON t.created_at::date = day
        GROUP BY day
        ORDER BY day
      `),
    ]);

    const v = vehicleCounts.rows[0];
    const t = tripCounts.rows[0];
    const d = driverCounts.rows[0];
    const totalVehicles = Number(v.total_vehicles);
    const vehiclesOnTrip = Number(v.vehicles_on_trip);
    const fleetUtilization =
      totalVehicles > 0 ? (vehiclesOnTrip / totalVehicles) * 100 : 0;

    res.json({
      activeVehicles: Number(v.active_vehicles),
      availableVehicles: Number(v.available_vehicles),
      vehiclesInMaintenance: Number(v.vehicles_in_maintenance),
      activeTrips: Number(t.active_trips),
      pendingTrips: Number(t.pending_trips),
      driversOnDuty: Number(d.drivers_on_duty),
      fleetUtilization: Math.round(fleetUtilization * 10) / 10,
      trend: trend.rows.map((r) => ({
        date: r.date,
        trips: Number(r.trips),
      })),
    });
  } catch (err) {
    console.error("GET /api/dashboard/kpis failed:", err);
    res.status(500).json({ error: "Failed to load dashboard KPIs" });
  }
});

export default router;
