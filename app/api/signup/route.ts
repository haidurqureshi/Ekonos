import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface SignupBody {
    name?: string;
    email?: string;
    password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fail = (error: string, status: number) =>
    NextResponse.json({ success: false, error }, { status });

export async function POST(request: NextRequest) {
    let body: SignupBody;
    try {
        body = await request.json();
    } catch {
        return fail('Invalid JSON', 400);
    }

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!name || !email || !password) return fail('Missing fields', 400);
    if (name.length > 100) return fail('Name too long', 400);
    if (!EMAIL_RE.test(email) || email.length > 254) return fail('Invalid email', 400);
    if (password.length < 8) return fail('Password too short', 400);
    if (new TextEncoder().encode(password).length > 72) return fail('Password too long', 400);

    try {
        const { env } = getCloudflareContext();
        const db = env.Ekonos;

        const jwtSecret = (env as unknown as Record<string, string | undefined>).JWT_SECRET
            ?? process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET is not configured');
            return fail('Server misconfigured', 500);
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const publicId = crypto.randomUUID();

        try {
            await db
                .prepare('INSERT INTO users (name, email, password_hash, public_id) VALUES (?, ?, ?, ?)')
                .bind(name, email, passwordHash, publicId)
                .run();
        } catch (dbErr) {
            const message = dbErr instanceof Error ? dbErr.message : String(dbErr);
            if (message.includes('UNIQUE constraint failed')) {
                return fail('Email taken', 409);
            }
            console.error('Signup DB error:', message);
            return fail('Database error', 500);
        }

        const token = await new SignJWT({ email })
            .setProtectedHeader({ alg: 'HS256' })
            .setSubject(publicId)
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
    } catch (err) {
        console.error('Signup error:', err);
        return fail('Internal error', 500);
    }
}
