import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        redirect('/login');
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    let payload;
    try {
        const { payload: p } = await jwtVerify(token, secret);
        payload = p;
    } catch {
        redirect('/login');
    }

    // Fetch name from D1
    const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/d1/database/${process.env.CF_D1_ID}/query`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CF_API_TOKEN_READ}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sql: 'SELECT name FROM users WHERE id = ?',
                params: [payload.id]
            }),
            cache: 'no-store'
        }
    );
    const data = await res.json();
    const name = data.result?.[0]?.results?.[0]?.name;

    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-white dark:bg-black min-h-screen">
            <h1 className="text-3xl font-semibold text-black dark:text-white">
                Welcome, {name}
            </h1>
        </div>
    );
}