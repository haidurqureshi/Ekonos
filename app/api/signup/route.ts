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

    try {
        // Check if email already exists
        const checkRes = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/d1/database/${process.env.CF_D1_ID}/query`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.CF_API_TOKEN_READ}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sql: 'SELECT id FROM users WHERE email = ?',
                    params: [email]
                })
            }
        );

        if (!checkRes.ok) {
            return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
        }

        const checkData = await checkRes.json();
        const rows = checkData?.result?.[0]?.results ?? [];

        if (rows.length > 0) {
            return NextResponse.json({ success: false, error: 'Email taken' }, { status: 409 });
        }

        // Hash password
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);
        const uuid = uuidv4();

        // Store in D1
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
