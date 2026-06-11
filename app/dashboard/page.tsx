import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import Image from "next/image";

export default async function Dashboard() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const handleSubmit = (e: React.FormEvent) => {
            cookieStore.delete('token');
            redirect('/login');
    }

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
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <p >Logout</p>
            <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-15 px-16 bg-white dark:bg-black sm:items-start">
                <Image 
                src="/EKONOS.svg" 
                alt="EKONOS logo" 
                width={100} 
                height={100} 
                priority 
                />
                <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
                    <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                        Welcome, {name}!
                    </h1>
                </div>
            </main>
        </div>
    );
}