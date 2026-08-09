import { NextRequest, NextResponse } from 'next/server';
import bcrypt from "bcryptjs";
import { SignJWT } from 'jose';
import { getCloudflareContext } from '@opennextjs/cloudflare';



interface LoginBody {
    email: string;
    password: string;
}

interface UserRow {
    id: number;
    email: string;
    password: string;
    public_id: string;
}

export async function POST(request: NextRequest) {
    const body = await request.json() as LoginBody;
    const { email, password } = body;

    if (!email || !password) {
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    let user: UserRow | null;
    try {
        const { env } = getCloudflareContext();
        const db = env.Ekonos;

        user = await db
            .prepare('SELECT id, email, password, public_id FROM users WHERE email = ?')
            .bind(email)
            .first<UserRow>();
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    if (!user) {
        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ id: user.public_id, email: user.email })
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
}
