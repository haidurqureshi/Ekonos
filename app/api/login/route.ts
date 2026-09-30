import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface LoginBody {
    email?: string;
    password?: string;
}

interface UserRow {
    id: number;
    email: string;
    password_hash: string;
    public_id: string;
}

const fail = (error: string, status: number) =>
    NextResponse.json({ success: false, error }, { status });

// Computed once per isolate, used to equalize timing when the email isn't found
let dummyHash: Promise<string> | undefined;



export async function POST(request: NextRequest) {
    let body: LoginBody;
    try {
        body = await request.json();
    } catch {
        return fail('Invalid JSON', 400);
    }

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) return fail('Missing fields', 400);
    if (email.length > 254 || password.length > 128) return fail('Invalid credentials', 401);

    let user: UserRow | null;
    let jwtSecret: string | undefined;
    try {
        const { env } = getCloudflareContext();
        jwtSecret = (env as unknown as Record<string, string | undefined>).JWT_SECRET
            ?? process.env.JWT_SECRET;

        user = await env.Ekonos
            .prepare('SELECT id, email, password_hash, public_id FROM users WHERE email = ?')
            .bind(email)
            .first<UserRow>();
    } catch (err) {
        console.error('Login DB error:', err);
        return fail('Database error', 500);
    }

    if (!jwtSecret) {
        console.error('JWT_SECRET is not configured');
        return fail('Server misconfigured', 500);
    }

    if (!user) {
        dummyHash ??= bcrypt.hash('dummy-password', 10);
        await bcrypt.compare(password, await dummyHash);
        return fail('Invalid credentials', 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) return fail('Invalid credentials', 401);

    const token = await new SignJWT({ email: user.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(user.public_id)
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(new TextEncoder().encode(jwtSecret));

    const response = NextResponse.json({ success: true });
    response.cookies.set('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    });
    return response;
}
