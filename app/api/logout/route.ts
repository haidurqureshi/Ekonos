import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "../../lib/auth";

// Clears the login cookie and goes to the login page. Pages use this when a
// token is valid but the account no longer exists, which avoids a redirect loop.
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete({ name: SESSION_COOKIE.name, path: "/" });
  return response;
}
