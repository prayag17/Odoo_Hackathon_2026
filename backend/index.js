import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import dashboardRouter from "./routes/dashboard.js";
import analyticsRouter from "./routes/analytics.js";
import vehiclesRouter from "./routes/vehicles.js";
import maintenanceRouter from "./routes/maintenance.js";
import driversRouter from "./routes/drivers.js";
import fuelRouter from "./routes/fuel.js";
import expensesRouter from "./routes/expenses.js";
import tripsRouter from "./routes/trips.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

// ngrok's multi-hop tunnel can send x-forwarded-proto as a duplicated,
// comma-joined value (e.g. "https, https"), which better-call's Node
// adapter concatenates into the request base URL unvalidated. Collapse
// it to the first value so that doesn't produce an unparseable URL.
app.use((req, res, next) => {
  const proto = req.headers["x-forwarded-proto"];
  if (typeof proto === "string" && proto.includes(",")) {
    req.headers["x-forwarded-proto"] = proto.split(",")[0].trim();
  }
  next();
});

// Scoped to /api/auth/* only — a bare "/api/*auth" wildcard matches every
// /api/ path (not just auth ones) and would swallow the feature routes below.
app.all("/api/auth/*rest", toNodeHandler(auth));

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());

app.use("/api/dashboard", dashboardRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/drivers", driversRouter);
app.use("/api/fuel-logs", fuelRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/trips", tripsRouter);

app.listen(port, () => {
  console.log(`Better Auth app listening on port ${port}`);
});
