import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const runtime = 'edge';

interface BudgetBody {
    adjusted_budget: number;
}

export async function POST(request: NextRequest) {
    const body = await request.json() as BudgetBody;
    const { adjusted_budget } = body;

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

    if (!adjusted_budget) {
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    try {
        const { env } = getCloudflareContext();
        const db = env.Ekonos;

        const updateResult = await db
            .prepare('UPDATE users SET budget = ? WHERE public_id = ?')
            .bind(adjusted_budget, userId!)
            .run();

        if (!updateResult.success) {
            console.error('Update failed:', updateResult);
            return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 201 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
