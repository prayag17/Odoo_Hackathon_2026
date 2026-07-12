import { Router } from "express";
import { pool } from "../db.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

// GET /api/maintenance?vehicle_id=&status=
router.get("/", async (req, res) => {
  try {
    const { vehicle_id, status } = req.query;
    const conditions = [];
    const values = [];

    if (vehicle_id) {
      values.push(vehicle_id);
      conditions.push(`vehicle_id = $${values.length}`);
    }
    if (status) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT * FROM maintenance_logs ${where} ORDER BY created_at DESC`,
      values,
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/maintenance failed:", err);
    res.status(500).json({ error: "Failed to load maintenance logs" });
  }
});

// POST /api/maintenance
router.post(
  "/",
  requireRole("fleet_manager", "safety_officer"),
  async (req, res) => {
    try {
      const { vehicle_id, description, cost, status } = req.body;

      if (!vehicle_id || !description) {
        return res
          .status(400)
          .json({ error: "vehicle_id and description are required" });
      }

      const logResult = await pool.query(
        `INSERT INTO maintenance_logs (vehicle_id, description, cost, status)
         VALUES ($1, $2, $3, COALESCE($4, 'Open'))
         RETURNING *`,
        [vehicle_id, description, cost ?? 0, status],
      );

      const log = logResult.rows[0];

      if (log.status === "Open") {
        await pool.query("UPDATE vehicles SET status = 'In Shop' WHERE id = $1", [
          vehicle_id,
        ]);
      }

      res.status(201).json(log);
    } catch (err) {
      console.error("POST /api/maintenance failed:", err);
      res.status(500).json({ error: "Failed to create maintenance log" });
    }
  },
);

// PATCH /api/maintenance/:id/close
router.patch(
  "/:id/close",
  requireRole("fleet_manager", "safety_officer"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const logResult = await pool.query(
        "UPDATE maintenance_logs SET status = 'Closed' WHERE id = $1 RETURNING *",
        [id],
      );

      if (logResult.rows.length === 0) {
        return res.status(404).json({ error: "Maintenance log not found" });
      }

      const log = logResult.rows[0];

      const vehicleResult = await pool.query(
        "SELECT status FROM vehicles WHERE id = $1",
        [log.vehicle_id],
      );

      if (vehicleResult.rows[0] && vehicleResult.rows[0].status !== "Retired") {
        await pool.query("UPDATE vehicles SET status = 'Available' WHERE id = $1", [
          log.vehicle_id,
        ]);
      }

      res.json(log);
    } catch (err) {
      console.error("PATCH /api/maintenance/:id/close failed:", err);
      res.status(500).json({ error: "Failed to close maintenance log" });
    }
  },
);

export default router;
