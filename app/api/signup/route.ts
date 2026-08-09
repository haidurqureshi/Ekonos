import { NextRequest, NextResponse } from 'next/server';
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import { SignJWT } from 'jose';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }
    if (password.length < 8) {
        return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    try {
        const { env } = getRequestContext();
        const db = env.Ekonos; // your D1 binding name, as set in wrangler.toml / Pages settings

        const passwordHash = await bcrypt.hash(password, 10);
        const uuid = uuidv4();

        // Insert directly, relying on a UNIQUE constraint on email
        // to catch duplicates atomically instead of check-then-insert.
        let insertResult;
        try {
            insertResult = await db
                .prepare('INSERT INTO users (name, email, password, public_id) VALUES (?, ?, ?, ?)')
                .bind(name, email, passwordHash, uuid)
                .run();
        } catch (dbErr: any) {
            const message = dbErr?.message ?? String(dbErr);
            if (message.includes('UNIQUE constraint failed')) {
                return NextResponse.json({ success: false, error: 'Email taken' }, { status: 409 });
            }
            console.error('D1 insert error:', message);
            return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
        }

        if (!insertResult.success || insertResult.meta.rows_written === 0) {
            console.error('D1 insert did not write a row:', insertResult);
            return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
        }

        // Create JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({ id: uuid, email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(secret);

        const response = NextResponse.json({ success: true });
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });
        return response;

    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
