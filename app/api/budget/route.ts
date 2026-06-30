import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { adjusted_budget } = body;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) redirect('/');

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    let payload;
    try {
        const { payload: p } = await jwtVerify(token, secret);
        payload = p;
    } catch {
        redirect('/login');
    }

    const user_id = payload.id;

    if (!adjusted_budget) {
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const d1Url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/d1/database/${process.env.CF_D1_ID}/query`;
    const d1Headers = {
        'Authorization': `Bearer ${process.env.CF_API_TOKEN}`,
        'Content-Type': 'application/json',
    };

    try {
        // 1. Insert the transaction
        const insertRes = await fetch(d1Url, {
            method: 'POST',
            headers: d1Headers,
            body: JSON.stringify({
                sql: 'INSERT INTO users (budget) VALUES (?) WHERE public_id = ?',
                params: [adjusted_budget, user_id]
            })
        });

        const insertJson = await insertRes.json();
        if (!insertRes.ok || !insertJson.success) {
            console.error(insertJson.errors);
            return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}