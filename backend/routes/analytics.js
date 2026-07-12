import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// One row per vehicle: distance/fuel from completed trips, fuel cost/liters
// from fuel_logs, maintenance cost from maintenance_logs.
const ANALYTICS_QUERY = `
  SELECT
    v.id,
    v.registration_number,
    v.name,
    v.acquisition_cost,
    COALESCE(SUM(t.actual_distance), 0) AS total_distance,
    COALESCE(fl.total_fuel_cost, 0) AS total_fuel_cost,
    COALESCE(fl.total_liters, 0) AS total_liters,
    COALESCE(ml.total_maintenance_cost, 0) AS total_maintenance_cost
  FROM vehicles v
  LEFT JOIN trips t ON t.vehicle_id = v.id AND t.status = 'Completed'
  LEFT JOIN (
    SELECT vehicle_id, SUM(cost) AS total_fuel_cost, SUM(liters) AS total_liters
    FROM fuel_logs
    GROUP BY vehicle_id
  ) fl ON fl.vehicle_id = v.id
  LEFT JOIN (
    SELECT vehicle_id, SUM(cost) AS total_maintenance_cost
    FROM maintenance_logs
    GROUP BY vehicle_id
  ) ml ON ml.vehicle_id = v.id
  GROUP BY v.id, fl.total_fuel_cost, fl.total_liters, ml.total_maintenance_cost
  ORDER BY v.name
`;

function computeRows(rows) {
  return rows.map((r) => {
    const distance = Number(r.total_distance);
    const liters = Number(r.total_liters);
    const fuelCost = Number(r.total_fuel_cost);
    const maintenanceCost = Number(r.total_maintenance_cost);
    const acquisitionCost = Number(r.acquisition_cost);
    const operationalCost = fuelCost + maintenanceCost;
    // No revenue field exists in the schema yet, so revenue defaults to 0
    // and ROI is effectively -operationalCost / acquisitionCost.
    const revenue = 0;
    const roi =
      acquisitionCost > 0 ? (revenue - operationalCost) / acquisitionCost : 0;

    return {
      vehicleId: r.id,
      registrationNumber: r.registration_number,
      name: r.name,
      fuelEfficiency: liters > 0 ? Math.round((distance / liters) * 100) / 100 : 0,
      operationalCost: Math.round(operationalCost * 100) / 100,
      roi: Math.round(roi * 10000) / 10000,
    };
  });
}

// GET /api/analytics
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(ANALYTICS_QUERY);
    res.json(computeRows(result.rows));
  } catch (err) {
    console.error("GET /api/analytics failed:", err);
    res.status(500).json({ error: "Failed to load analytics" });
  }
});

// GET /api/analytics/export.csv
router.get("/export.csv", async (req, res) => {
  try {
    const result = await pool.query(ANALYTICS_QUERY);
    const rows = computeRows(result.rows);

    const header = "Vehicle,Registration,Fuel Efficiency (km/L),Operational Cost,ROI";
    const lines = rows.map((r) =>
      [r.name, r.registrationNumber, r.fuelEfficiency, r.operationalCost, r.roi]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [header, ...lines].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="analytics.csv"');
    res.send(csv);
  } catch (err) {
    console.error("GET /api/analytics/export.csv failed:", err);
    res.status(500).json({ error: "Failed to export analytics" });
  }
});

export default router;
