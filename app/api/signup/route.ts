import { NextRequest, NextResponse } from 'next/server';
import bcrypt from "bcryptjs";

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
                    sql: 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                    params: [name, email, passwordHash]
                })
            }
        );
    } catch{
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}