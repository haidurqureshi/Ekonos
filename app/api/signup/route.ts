import { NextRequest, NextResponse } from 'next/server';
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import { SignJWT } from 'jose';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface SignupBody {
    name: string;
    email: string;
    password: string;
}

export async function POST(request: NextRequest) {
    const body = await request.json() as SignupBody;
    const { name, email, password } = body;

    if (!name || !email || !password) {
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    try {
        const { env } = getCloudflareContext();
        const db = env.Ekonos;

        const passwordHash = await bcrypt.hash(password, 10);
        const uuid = uuidv4();

        let insertResult;
        try {
            insertResult = await db
                .prepare('INSERT INTO users (name, email, password_hash, public_id) VALUES (?, ?, ?, ?)')
                .bind(name, email, passwordHash, uuid)
                .run();
        } catch (dbErr: unknown) {
            const message = dbErr instanceof Error ? dbErr.message : String(dbErr);
            if (message.includes('UNIQUE constraint failed')) {
                return NextResponse.json({ success: false, error: 'Email taken' }, { status: 409 });
            }
            return NextResponse.json({ success: false, error: message }, { status: 500 });
        }

        if (!insertResult.success) {
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
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
