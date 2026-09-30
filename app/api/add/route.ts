import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getCloudflareContext } from '@opennextjs/cloudflare';

const fail = (error: string, status: number) =>
    NextResponse.json({ success: false, error }, { status });

const MAX_BUDGET = 1_000_000_000;

export async function POST(request: NextRequest) {
    try {
        const { env } = getCloudflareContext();

        const jwtSecret =
            (env as unknown as Record<string, string | undefined>).JWT_SECRET ??
            process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET is not configured');
            return fail('Server misconfigured', 500);
        }

        const token = request.cookies.get('token')?.value;
        if (!token) return fail('Unauthorized', 401);

        let userId: string;
        try {
            const { payload } = await jwtVerify(
                token,
                new TextEncoder().encode(jwtSecret),
                { algorithms: ['HS256'] }
            );
            if (typeof payload.sub !== 'string') return fail('Unauthorized', 401);
            userId = payload.sub;
        } catch {
            return fail('Unauthorized', 401);
        }

        let body: { adjusted_budget?: unknown };
        try {
            body = await request.json();
        } catch {
            return fail('Invalid JSON', 400);
        }

        const budget = body.adjusted_budget;
        if (
            typeof budget !== 'number' ||
            !Number.isFinite(budget) ||
            budget < 0 ||
            budget > MAX_BUDGET
        ) {
            return fail('Invalid budget', 400);
        }

        const result = await env.Ekonos
            .prepare('UPDATE users SET budget = ? WHERE public_id = ?')
            .bind(budget, userId)
            .run();

        if (result.meta.changes === 0) return fail('User not found', 404);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Budget update error:', err);
        return fail('Server error', 500);
    }
}
