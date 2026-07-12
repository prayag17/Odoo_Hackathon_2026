import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";

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

app.all("/api/*auth", toNodeHandler(auth));

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());

app.listen(port, () => {
  console.log(`Better Auth app listening on port ${port}`);
});
