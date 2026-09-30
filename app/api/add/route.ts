import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface AddTransactionBody {
    brand?: unknown;
    price?: unknown;
    category?: unknown;
    ethical_score?: unknown;
}

const fail = (error: string, status: number) =>
    NextResponse.json({ success: false, error }, { status });

const MAX_AMOUNT_PENCE = 100_000_000_000; // £1 billion

const VALID_CATEGORIES = new Set([
    'Transport',
    'Shopping',
    'Other',
]);

export async function POST(request: NextRequest) {
    try {
        const { env } = getCloudflareContext();

        // Get JWT secret from Cloudflare environment variables.
        const jwtSecret =
            (env as unknown as Record<string, string | undefined>).JWT_SECRET ??
            process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error('JWT_SECRET is not configured');
            return fail('Server misconfigured', 500);
        }

        // Get authentication token.
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return fail('Unauthorized', 401);
        }

        // Verify the JWT and get the user's public_id from `sub`.
        let userId: string;

        try {
            const { payload } = await jwtVerify(
                token,
                new TextEncoder().encode(jwtSecret),
                {
                    algorithms: ['HS256'],
                }
            );

            if (typeof payload.sub !== 'string') {
                return fail('Unauthorized', 401);
            }

            userId = payload.sub;
        } catch {
            return fail('Unauthorized', 401);
        }

        // Read request body.
        let body: AddTransactionBody;

        try {
            body = await request.json();
        } catch {
            return fail('Invalid JSON', 400);
        }

        // Validate brand.
        const brand =
            typeof body.brand === 'string'
                ? body.brand.trim()
                : '';

        if (!brand) {
            return fail('Brand is required', 400);
        }

        if (brand.length > 200) {
            return fail('Brand name too long', 400);
        }

        // Validate price.
        if (
            typeof body.price !== 'number' ||
            !Number.isFinite(body.price) ||
            body.price < 0
        ) {
            return fail('Invalid price', 400);
        }

        // Convert pounds to pence because the database stores amount_pence.
        const amountPence = Math.round(body.price * 100);

        if (
            !Number.isSafeInteger(amountPence) ||
            amountPence < 0 ||
            amountPence > MAX_AMOUNT_PENCE
        ) {
            return fail('Invalid price', 400);
        }

        // Validate category.
        if (
            typeof body.category !== 'string' ||
            !VALID_CATEGORIES.has(body.category)
        ) {
            return fail('Invalid category', 400);
        }

        const category = body.category;

        // Validate ethical score.
        if (
            typeof body.ethical_score !== 'number' ||
            !Number.isFinite(body.ethical_score) ||
            body.ethical_score < 0 ||
            body.ethical_score > 100
        ) {
            return fail('Invalid ethical score', 400);
        }

        const ethicalScore = body.ethical_score;

        // Insert the transaction.
        //
        // user_id references users.public_id,
        // so we use the JWT `sub` value here.
        await env.Ekonos
            .prepare(`
                INSERT INTO transactions (
                    user_id,
                    company_name,
                    amount_pence,
                    category,
                    ethical_score
                )
                VALUES (?, ?, ?, ?, ?)
            `)
            .bind(
                userId,
                brand,
                amountPence,
                category,
                ethicalScore
            )
            .run();

        return NextResponse.json({
            success: true,
        });
    } catch (err) {
        console.error('Add transaction error:', err);
        return fail('Server error', 500);
    }
}
