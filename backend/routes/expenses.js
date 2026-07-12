import { Router } from "express";
import { pool } from "../db.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

// GET /api/expenses?vehicle_id=
router.get("/", async (req, res) => {
  try {
    const { vehicle_id } = req.query;

    if (vehicle_id) {
      const result = await pool.query(
        "SELECT * FROM expenses WHERE vehicle_id = $1 ORDER BY expense_date DESC",
        [vehicle_id],
      );
      return res.json(result.rows);
    }

    const result = await pool.query(
      "SELECT * FROM expenses ORDER BY expense_date DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/expenses failed:", err);
    res.status(500).json({ error: "Failed to load expenses" });
  }
});

// POST /api/expenses
router.post(
  "/",
  requireRole("fleet_manager", "financial_analyst"),
  async (req, res) => {
    try {
      const { vehicle_id, category, amount, expense_date, notes } = req.body;

      if (!category || amount == null) {
        return res
          .status(400)
          .json({ error: "category and amount are required" });
      }

      const result = await pool.query(
        `INSERT INTO expenses (vehicle_id, category, amount, expense_date, notes)
         VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5)
         RETURNING *`,
        [vehicle_id ?? null, category, amount, expense_date ?? null, notes ?? null],
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("POST /api/expenses failed:", err);
      res.status(500).json({ error: "Failed to create expense" });
    }
  },
);

export default router;
