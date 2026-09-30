import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { fail, getUserId } from '@/api/authentic';

interface BudgetBody {
    adjusted_budget?: unknown;
}

const MAX_BUDGET = 1_000_000_000;

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserId(request);
        if (!userId) return fail('Unauthorized', 401);

        let body: BudgetBody;
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

        const { env } = getCloudflareContext();
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
