import { Router } from "express";
import { pool } from "../db.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

// GET /api/fuel-logs?vehicle_id=
router.get("/", async (req, res) => {
  try {
    const { vehicle_id } = req.query;

    if (vehicle_id) {
      const result = await pool.query(
        "SELECT * FROM fuel_logs WHERE vehicle_id = $1 ORDER BY log_date DESC",
        [vehicle_id],
      );
      return res.json(result.rows);
    }

    const result = await pool.query("SELECT * FROM fuel_logs ORDER BY log_date DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/fuel-logs failed:", err);
    res.status(500).json({ error: "Failed to load fuel logs" });
  }
});

// POST /api/fuel-logs
router.post(
  "/",
  requireRole("fleet_manager", "financial_analyst"),
  async (req, res) => {
    try {
      const { vehicle_id, liters, cost, log_date } = req.body;

      if (!vehicle_id || liters == null || cost == null) {
        return res
          .status(400)
          .json({ error: "vehicle_id, liters and cost are required" });
      }

      const result = await pool.query(
        `INSERT INTO fuel_logs (vehicle_id, liters, cost, log_date)
         VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE))
         RETURNING *`,
        [vehicle_id, liters, cost, log_date ?? null],
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("POST /api/fuel-logs failed:", err);
      res.status(500).json({ error: "Failed to create fuel log" });
    }
  },
);

export default router;
