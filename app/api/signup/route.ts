import { NextRequest, NextResponse } from 'next/server';
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { name, email, password } = body;

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Store in D1
    try {
        await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/d1/database/${process.env.CF_D1_ID}/query`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.CF_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sql: 'INSERT INTO users (name, email, password, user_id) VALUES (?, ?, ?, ?)',
                    params: [name, email, passwordHash, uuidv4()]
                })
            }
        );
    } catch{
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    // Get user from D1
    let user;
    try {
        const res = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/d1/database/${process.env.CF_D1_ID}/query`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.CF_API_TOKEN_READ}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sql: 'SELECT id, email, password FROM users WHERE email = ?',
                    params: [email]
                })
            }
        );
        const data = await res.json();
        user = data.result?.[0]?.results?.[0];
    } catch {
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    if (!user) {
        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    if (!bcrypt.compareSync(password, user.password)) {
        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ id: user.id, email: user.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(secret);

    // Set JWT in cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    return NextResponse.json({ success: true });
}