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
        const passwordHash = await bcrypt.hash(password, 10);
        const uuid = uuidv4();

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

        const insertData = await insertRes.json();
        console.log('D1 response:', JSON.stringify(insertData));

        const rowsWritten = insertData?.result?.[0]?.meta?.rows_written ?? 0;

        if (!insertData?.success || rowsWritten === 0) {
            const message = insertData?.errors?.[0]?.message ?? insertData?.result?.[0]?.error ?? 'unknown';
            if (message.includes('UNIQUE constraint failed')) {
                return NextResponse.json({ success: false, error: 'Email taken' }, { status: 409 });
            }
            console.error('D1 insert did not write:', message);
            return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
        }

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
            maxAge: 60 * 60 * 24 * 7
        });
        return response;

    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
