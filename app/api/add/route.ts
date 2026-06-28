import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { brand, price, category, ethical_score } = body;
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

    const user_id = payload.id

    if (!brand || !price || !category || !ethical_score) {
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }


    try {
        const insertRes = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/d1/database/${process.env.CF_D1_ID}/query`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.CF_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sql: 'INSERT INTO transactions (user_id, company_name, amount, category, ethical_score) VALUES (?, ?, ?, ?, ?)',
                    params: [user_id, brand, price, category, ethical_score]
                })
            }
        );

        if (!insertRes.ok) {
            return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
        }
        return NextResponse.json({ success: true}, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
