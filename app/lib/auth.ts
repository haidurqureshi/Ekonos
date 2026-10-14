import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Returns the logged-in user's public id, or null if the token is missing or invalid.
// Same check the dashboard uses: HS256 signature and a string `sub`.
export async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const { env } = getCloudflareContext();
  const jwtSecret =
    (env as unknown as Record<string, string | undefined>).JWT_SECRET ??
    process.env.JWT_SECRET;
  if (!jwtSecret) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(jwtSecret),
      { algorithms: ["HS256"] },
    );
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
