import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from '@opennextjs/cloudflare';



interface AddBody {
    brand: string;
    price: number;
    category: string;
    ethical_score: number;
}

export async function POST(request: NextRequest) {
    const body = await request.json() as AddBody;
    const { brand, price, category, ethical_score } = body;

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) redirect('/');

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    let userId: string;
    try {
        const { payload } = await jwtVerify(token, secret);
        userId = payload.id as string;
    } catch {
        redirect('/login');
    }

    if (!brand || !price || !category || !ethical_score) {
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    try {
        const { env } = getCloudflareContext();
        const db = env.Ekonos;

        // 1. Insert the transaction
        const insertResult = await db
            .prepare('INSERT INTO transactions (user_id, company_name, amount, category, ethical_score) VALUES (?, ?, ?, ?, ?)')
            .bind(userId!, brand, price, category, ethical_score)
            .run();

        if (!insertResult.success) {
            console.error('Insert failed:', insertResult);
            return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
        }

        // 2. Recalculate this user's ethics averages
        const updateResult = await db
            .prepare(
                `UPDATE users
                 SET
                   ethical_score    = (SELECT AVG(ethical_score) FROM transactions WHERE user_id = ?),
                   shopping_ethics  = (SELECT AVG(ethical_score) FROM transactions WHERE user_id = ? AND category = 'Shopping'),
                   transport_ethics = (SELECT AVG(ethical_score) FROM transactions WHERE user_id = ? AND category = 'Transport'),
                   other_ethics     = (SELECT AVG(ethical_score) FROM transactions WHERE user_id = ? AND category = 'Other')
                 WHERE public_id = ?`
            )
            .bind(userId!, userId!, userId!, userId!, userId!)
            .run();

        if (!updateResult.success) {
            console.error('Update failed:', updateResult);
            return NextResponse.json({ success: false, error: 'Failed to update ethics averages' }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 201 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
