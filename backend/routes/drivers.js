import { Router } from "express";
import { pool } from "../db.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

const DRIVER_FIELDS = [
  "name",
  "license_number",
  "license_category",
  "license_expiry_date",
  "contact_number",
  "safety_score",
  "status",
];

const SELECT_WITH_LICENSE_VALID = `
  SELECT *,
    (license_expiry_date IS NOT NULL AND license_expiry_date >= CURRENT_DATE) AS license_valid
  FROM drivers
`;

// GET /api/drivers?status=Available
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    if (status) {
      const result = await pool.query(
        `${SELECT_WITH_LICENSE_VALID} WHERE status = $1 ORDER BY name`,
        [status],
      );
      return res.json(result.rows);
    }

    const result = await pool.query(`${SELECT_WITH_LICENSE_VALID} ORDER BY name`);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/drivers failed:", err);
    res.status(500).json({ error: "Failed to load drivers" });
  }
});

// POST /api/drivers
router.post(
  "/",
  requireRole("fleet_manager", "safety_officer"),
  async (req, res) => {
    try {
      const {
        name,
        license_number,
        license_category,
        license_expiry_date,
        contact_number,
        safety_score,
        status,
      } = req.body;

      if (!name || !license_number) {
        return res
          .status(400)
          .json({ error: "name and license_number are required" });
      }

      const result = await pool.query(
        `INSERT INTO drivers
          (name, license_number, license_category, license_expiry_date, contact_number, safety_score, status)
         VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'Available'))
         RETURNING *`,
        [
          name,
          license_number,
          license_category ?? null,
          license_expiry_date ?? null,
          contact_number ?? null,
          safety_score ?? 100,
          status,
        ],
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res
          .status(409)
          .json({ error: "A driver with this license number already exists" });
      }
      console.error("POST /api/drivers failed:", err);
      res.status(500).json({ error: "Failed to create driver" });
    }
  },
);

// PATCH /api/drivers/:id
router.patch(
  "/:id",
  requireRole("fleet_manager", "safety_officer"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = DRIVER_FIELDS.filter((field) => field in req.body);

      if (updates.length === 0) {
        return res.status(400).json({ error: "No updatable fields provided" });
      }

      const setClause = updates
        .map((field, index) => `${field} = $${index + 2}`)
        .join(", ");
      const values = updates.map((field) => req.body[field]);

      const result = await pool.query(
        `UPDATE drivers SET ${setClause} WHERE id = $1 RETURNING *`,
        [id, ...values],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Driver not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res
          .status(409)
          .json({ error: "A driver with this license number already exists" });
      }
      console.error("PATCH /api/drivers/:id failed:", err);
      res.status(500).json({ error: "Failed to update driver" });
    }
  },
);

export default router;
