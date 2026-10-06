import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Pages that need a logged-in user.
const PROTECTED = [
  "/dashboard",
  "/add-item",
  "/edit-budget",
  "/ethical-breakdown",
];

// Pages a logged-in user has no reason to see.
const AUTH_PAGES = ["/login", "/start"];

type TokenStatus = "valid" | "invalid" | "unknown";

// Same check the dashboard does: HS256 signature and a string `sub`.
// "unknown" means the secret isn't readable here, so we let the page's own
// check decide rather than wrongly logging someone out.
async function checkToken(token: string): Promise<TokenStatus> {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return "unknown";

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(jwtSecret),
      { algorithms: ["HS256"] },
    );
    return typeof payload.sub === "string" ? "valid" : "invalid";
  } catch {
    return "invalid";
  }
}

function redirectTo(request: NextRequest, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (isProtected) {
    if (!token) return redirectTo(request, "/login");

    if ((await checkToken(token)) === "invalid") {
      // Expired or tampered token: clear it and send them to log in again.
      const response = redirectTo(request, "/login");
      response.cookies.delete("token");
      return response;
    }
  }

  // Only redirect away from login/signup when the token is verifiably valid,
  // otherwise a bad cookie would bounce between /login and /dashboard forever.
  if (isAuthPage && token && (await checkToken(token)) === "valid") {
    return redirectTo(request, "/dashboard");
  }

  return NextResponse.next();
}

// Run only on the pages above. API routes check the token themselves.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/add-item/:path*",
    "/edit-budget/:path*",
    "/ethical-breakdown/:path*",
    "/login",
    "/start",
  ],
};
