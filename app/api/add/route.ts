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

    const user_id = payload.id;

    if (!brand || !price || !category || !ethical_score) {
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
                sql: 'INSERT INTO transactions (user_id, company_name, amount, category, ethical_score) VALUES (?, ?, ?, ?, ?)',
                params: [user_id, brand, price, category, ethical_score]
            })
        });

        const insertJson = await insertRes.json();
        if (!insertRes.ok || !insertJson.success) {
            console.error(insertJson.errors);
            return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
        }

        // 2. Recalculate this user's ethics averages
        const updateRes = await fetch(d1Url, {
            method: 'POST',
            headers: d1Headers,
            body: JSON.stringify({
                sql: `UPDATE users
                      SET
                        ethical_score    = (SELECT AVG(ethical_score) FROM transactions WHERE user_id = ?),
                        shopping_ethics  = (SELECT AVG(ethical_score) FROM transactions WHERE user_id = ? AND category = 'Shopping'),
                        transport_ethics = (SELECT AVG(ethical_score) FROM transactions WHERE user_id = ? AND category = 'Transport'),
                        other_ethics     = (SELECT AVG(ethical_score) FROM transactions WHERE user_id = ? AND category = 'Other')
                      WHERE public_id = ?`,
                params: [user_id, user_id, user_id, user_id, user_id]
            })
        });

        const updateJson = await updateRes.json();
        if (!updateRes.ok || !updateJson.success) {
            console.error(updateJson.errors);
            return NextResponse.json({ success: false, error: 'Failed to update ethics averages' }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
