import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getJwtSecret(): string | null {
  const { env } = getCloudflareContext();
  return (
    (env as unknown as Record<string, string | undefined>).JWT_SECRET ??
    process.env.JWT_SECRET ??
    null
  );
}

// Creates the login token. The user's public id is stored as the standard
// `sub` claim, which is what every page and API route reads.
export async function signToken(publicId: string, email: string) {
  const secret = getJwtSecret();
  if (!secret) throw new Error("JWT_SECRET is not configured");

  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(publicId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(secret));
}

export const SESSION_COOKIE = {
  name: "token",
  options: {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

// Returns the logged-in user's public id, or null if the token is missing or invalid.
export async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE.name)?.value;
  if (!token) return null;

  const jwtSecret = getJwtSecret();
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
