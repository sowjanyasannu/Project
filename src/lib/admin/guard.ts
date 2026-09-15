import "server-only";
import { getCurrentAdmin } from "@/lib/auth";
import type { AdminRole } from "@/types/database";

/**
 * Every admin server action must call this before touching the
 * service-role client — RLS is bypassed there, so this is the only gate.
 */
export async function requireAdmin(allowedRoles?: AdminRole[]) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Not authorized.");
  if (allowedRoles && !allowedRoles.includes(admin.role)) {
    throw new Error("You do not have permission to perform this action.");
  }
  return admin;
}
