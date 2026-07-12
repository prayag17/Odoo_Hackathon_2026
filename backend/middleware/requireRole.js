import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";

// Tiny role gate: requireRole('fleet_manager', 'safety_officer') as Express
// middleware in front of any write route. No permission matrix, just a
// role allowlist read off the better-auth session.
export function requireRole(...roles) {
  return async function requireRoleMiddleware(req, res, next) {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!roles.includes(session.user.role)) {
      return res
        .status(403)
        .json({ error: "You do not have permission to perform this action" });
    }

    req.user = session.user;
    next();
  };
}
