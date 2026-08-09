import { NextRequest, NextResponse } from 'next/server';
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    // Basic format checks
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }
    if (password.length < 8) {
        return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    try {
        // Hash password (async, non-blocking)
        const passwordHash = await bcrypt.hash(password, 10);
        const uuid = uuidv4();

        // Insert directly, relying on a UNIQUE constraint on email
        // to catch duplicates atomically instead of check-then-insert.
        const insertRes = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/d1/database/${process.env.CF_D1_ID}/query`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.CF_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sql: 'INSERT INTO users (name, email, password, public_id) VALUES (?, ?, ?, ?)',
                    params: [name, email, passwordHash, uuid]
                })
            }
        );

        if (!insertRes.ok) {
            const errText = await insertRes.text();
            // D1 surfaces constraint violations in the error message,
            // e.g. "UNIQUE constraint failed: users.email"
            if (errText.includes('UNIQUE constraint failed')) {
                return NextResponse.json({ success: false, error: 'Email taken' }, { status: 409 });
            }
            console.error('D1 insert error:', errText);
            return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
        }

        const insertData = await insertRes.json();
        if (!insertData?.success) {
            const message = insertData?.errors?.[0]?.message ?? '';
            if (message.includes('UNIQUE constraint failed')) {
                return NextResponse.json({ success: false, error: 'Email taken' }, { status: 409 });
            }
            console.error('D1 insert failed:', insertData);
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
