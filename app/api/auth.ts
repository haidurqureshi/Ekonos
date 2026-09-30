import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const fail = (error: string, status: number) =>
    NextResponse.json({ success: false, error }, { status });

export const AUTH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
};

// Throws if unset, so a misconfigured server is a 500, not a forgeable secret
export function getJwtSecret(): Uint8Array {
    const { env } = getCloudflareContext();
    const secret =
        (env as unknown as Record<string, string | undefined>).JWT_SECRET ??
        process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not configured');
    return new TextEncoder().encode(secret);
}

// Returns the user's public_id, or null if unauthenticated
export async function getUserId(request: NextRequest): Promise<string | null> {
    const token = request.cookies.get('token')?.value;
    const secret = getJwtSecret();
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
        return typeof payload.sub === 'string' ? payload.sub : null;
    } catch {
        return null;
    }
}
