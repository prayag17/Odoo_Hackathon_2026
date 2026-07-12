import { Router } from "express";
import { pool } from "../db.js";
import { requireRole } from "../middleware/requireRole.js";
import { toPrefixTsQuery } from "../lib/search.js";

const router = Router();

const VEHICLE_FIELDS = [
  "registration_number",
  "name",
  "type",
  "max_load_capacity",
  "odometer",
  "acquisition_cost",
  "status",
  "region",
  "image",
];

// GET /api/vehicles?status=Available&q=search+terms
router.get("/", async (req, res) => {
  try {
    const { status, q } = req.query;
    const conditions = [];
    const values = [];

    if (status) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }
    const tsQuery = q ? toPrefixTsQuery(q) : "";
    if (tsQuery) {
      values.push(tsQuery);
      conditions.push(
        `to_tsvector('english', registration_number || ' ' || name || ' ' || type || ' ' || COALESCE(region, '')) @@ to_tsquery('english', $${values.length})`,
      );
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT * FROM vehicles ${where} ORDER BY name`,
      values,
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/vehicles failed:", err);
    res.status(500).json({ error: "Failed to load vehicles" });
  }
});

// POST /api/vehicles
router.post("/", requireRole("fleet_manager"), async (req, res) => {
  try {
    const {
      registration_number,
      name,
      type,
      max_load_capacity,
      odometer,
      acquisition_cost,
      status,
      region,
      image,
    } = req.body;

    if (!registration_number || !name || !type) {
      return res
        .status(400)
        .json({ error: "registration_number, name and type are required" });
    }

    const result = await pool.query(
      `INSERT INTO vehicles
        (registration_number, name, type, max_load_capacity, odometer, acquisition_cost, status, region, image)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'Available'), $8, $9)
       RETURNING *`,
      [
        registration_number,
        name,
        type,
        max_load_capacity ?? 0,
        odometer ?? 0,
        acquisition_cost ?? 0,
        status,
        region ?? null,
        image ?? null,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ error: "A vehicle with this registration number already exists" });
    }
    console.error("POST /api/vehicles failed:", err);
    res.status(500).json({ error: "Failed to create vehicle" });
  }
});

// PATCH /api/vehicles/:id
router.patch("/:id", requireRole("fleet_manager"), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = VEHICLE_FIELDS.filter((field) => field in req.body);

    if (updates.length === 0) {
      return res.status(400).json({ error: "No updatable fields provided" });
    }

    const setClause = updates
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");
    const values = updates.map((field) => req.body[field]);

    const result = await pool.query(
      `UPDATE vehicles SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ error: "A vehicle with this registration number already exists" });
    }
    console.error("PATCH /api/vehicles/:id failed:", err);
    res.status(500).json({ error: "Failed to update vehicle" });
  }
});

export default router;
