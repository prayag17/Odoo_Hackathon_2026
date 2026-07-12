import { Router } from "express";
import { pool } from "../db.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

// GET /api/trips?status=
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    if (status) {
      const result = await pool.query(
        "SELECT * FROM trips WHERE status = $1 ORDER BY created_at DESC",
        [status],
      );
      return res.json(result.rows);
    }

    const result = await pool.query("SELECT * FROM trips ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/trips failed:", err);
    res.status(500).json({ error: "Failed to load trips" });
  }
});

// POST /api/trips
router.post("/", requireRole("fleet_manager"), async (req, res) => {
  try {
    const {
      source,
      destination,
      vehicle_id,
      driver_id,
      cargo_weight,
      planned_distance,
    } = req.body;

    if (!source || !destination || !vehicle_id || !driver_id) {
      return res.status(400).json({
        error: "source, destination, vehicle_id and driver_id are required",
      });
    }

    const vehicleResult = await pool.query(
      "SELECT * FROM vehicles WHERE id = $1",
      [vehicle_id],
    );
    const vehicle = vehicleResult.rows[0];

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const weight = Number(cargo_weight) || 0;
    if (weight > Number(vehicle.max_load_capacity)) {
      return res.status(400).json({
        error: `Cargo weight (${weight}) exceeds vehicle max load capacity (${vehicle.max_load_capacity})`,
      });
    }

    const result = await pool.query(
      `INSERT INTO trips
        (source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Draft')
       RETURNING *`,
      [source, destination, vehicle_id, driver_id, weight, planned_distance ?? null],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/trips failed:", err);
    res.status(500).json({ error: "Failed to create trip" });
  }
});

// PATCH /api/trips/:id/dispatch
router.patch("/:id/dispatch", requireRole("fleet_manager"), async (req, res) => {
  try {
    const { id } = req.params;

    const tripResult = await pool.query("SELECT * FROM trips WHERE id = $1", [id]);
    const trip = tripResult.rows[0];
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    if (trip.status !== "Draft") {
      return res
        .status(400)
        .json({ error: `Trip cannot be dispatched from status "${trip.status}"` });
    }

    const vehicleResult = await pool.query(
      "SELECT * FROM vehicles WHERE id = $1",
      [trip.vehicle_id],
    );
    const vehicle = vehicleResult.rows[0];
    if (!vehicle || vehicle.status !== "Available") {
      return res.status(400).json({ error: "Vehicle is not available for dispatch" });
    }

    const driverResult = await pool.query(
      "SELECT * FROM drivers WHERE id = $1",
      [trip.driver_id],
    );
    const driver = driverResult.rows[0];
    if (!driver || driver.status !== "Available") {
      return res.status(400).json({ error: "Driver is not available for dispatch" });
    }
    if (
      driver.license_expiry_date &&
      new Date(driver.license_expiry_date) < new Date()
    ) {
      return res.status(400).json({ error: "Driver's license has expired" });
    }

    const [updatedTrip] = (
      await pool.query(
        "UPDATE trips SET status = 'Dispatched' WHERE id = $1 RETURNING *",
        [id],
      )
    ).rows;
    await pool.query("UPDATE vehicles SET status = 'On Trip' WHERE id = $1", [
      trip.vehicle_id,
    ]);
    await pool.query("UPDATE drivers SET status = 'On Trip' WHERE id = $1", [
      trip.driver_id,
    ]);

    res.json(updatedTrip);
  } catch (err) {
    console.error("PATCH /api/trips/:id/dispatch failed:", err);
    res.status(500).json({ error: "Failed to dispatch trip" });
  }
});

// PATCH /api/trips/:id/complete
router.patch("/:id/complete", requireRole("fleet_manager"), async (req, res) => {
  try {
    const { id } = req.params;
    const { final_odometer, fuel_consumed } = req.body;

    if (final_odometer == null || fuel_consumed == null) {
      return res
        .status(400)
        .json({ error: "final_odometer and fuel_consumed are required" });
    }

    const tripResult = await pool.query("SELECT * FROM trips WHERE id = $1", [id]);
    const trip = tripResult.rows[0];
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    if (trip.status !== "Dispatched") {
      return res
        .status(400)
        .json({ error: `Trip cannot be completed from status "${trip.status}"` });
    }

    const vehicleResult = await pool.query(
      "SELECT * FROM vehicles WHERE id = $1",
      [trip.vehicle_id],
    );
    const vehicle = vehicleResult.rows[0];
    const previousOdometer = Number(vehicle.odometer);
    const finalOdometer = Number(final_odometer);

    if (finalOdometer < previousOdometer) {
      return res.status(400).json({
        error: `final_odometer (${finalOdometer}) cannot be less than current odometer (${previousOdometer})`,
      });
    }

    const actualDistance = finalOdometer - previousOdometer;

    const [updatedTrip] = (
      await pool.query(
        `UPDATE trips
         SET status = 'Completed', actual_distance = $2, fuel_consumed = $3
         WHERE id = $1
         RETURNING *`,
        [id, actualDistance, fuel_consumed],
      )
    ).rows;
    await pool.query(
      "UPDATE vehicles SET status = 'Available', odometer = $2 WHERE id = $1",
      [trip.vehicle_id, finalOdometer],
    );
    await pool.query("UPDATE drivers SET status = 'Available' WHERE id = $1", [
      trip.driver_id,
    ]);

    res.json(updatedTrip);
  } catch (err) {
    console.error("PATCH /api/trips/:id/complete failed:", err);
    res.status(500).json({ error: "Failed to complete trip" });
  }
});

// PATCH /api/trips/:id/cancel
router.patch("/:id/cancel", requireRole("fleet_manager"), async (req, res) => {
  try {
    const { id } = req.params;

    const tripResult = await pool.query("SELECT * FROM trips WHERE id = $1", [id]);
    const trip = tripResult.rows[0];
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    if (trip.status !== "Dispatched") {
      return res
        .status(400)
        .json({ error: `Trip cannot be cancelled from status "${trip.status}"` });
    }

    const [updatedTrip] = (
      await pool.query(
        "UPDATE trips SET status = 'Cancelled' WHERE id = $1 RETURNING *",
        [id],
      )
    ).rows;
    await pool.query("UPDATE vehicles SET status = 'Available' WHERE id = $1", [
      trip.vehicle_id,
    ]);
    await pool.query("UPDATE drivers SET status = 'Available' WHERE id = $1", [
      trip.driver_id,
    ]);

    res.json(updatedTrip);
  } catch (err) {
    console.error("PATCH /api/trips/:id/cancel failed:", err);
    res.status(500).json({ error: "Failed to cancel trip" });
  }
});

export default router;
