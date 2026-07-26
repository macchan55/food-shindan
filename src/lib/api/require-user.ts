import "server-only";
import { getAuthUser } from "@/lib/supabase/server";

class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Resolves the logged-in user's id for a Route Handler, or throws a 401 AuthError. */
export async function requireUserId(): Promise<string> {
  const user = await getAuthUser();
  if (!user) throw new AuthError("Not signed in", 401);
  return user.id;
}
