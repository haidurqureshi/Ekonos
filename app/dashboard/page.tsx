import Image from "next/image";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

async function logout() {
    "use server"
    const cookieStore = await cookies();
    cookieStore.delete('token');
    redirect('/login');
}

export default async function Dashboard() {
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

    const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/d1/database/${process.env.CF_D1_ID}/query`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CF_API_TOKEN_READ}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sql: 'SELECT name, public_id, budget, ethical_score, shopping_ethics, transport_ethics, other_ethics FROM users WHERE public_id = ?',
                params: [payload.id]
            }),
            cache: 'no-store'
        }
    );
    const data = await res.json();
    const name = data.result?.[0]?.results?.[0]?.name;
    const public_id = payload.id;
    const transactions = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/d1/database/${process.env.CF_D1_ID}/query`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CF_API_TOKEN_READ}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sql: 'SELECT amount FROM transactions WHERE user_id = ?',
                params: [public_id]
            }),
            cache: 'no-store'
        }
    );

    const transactions_data = await transactions.json();
    const total_spent = transactions_data.result?.[0]?.results?.reduce((sum: number, t: { amount?: number }) => sum + (t.amount || 0), 0) || 0;
    const budget = data.result?.[0]?.results?.[0]?.budget || 0;
    const ethics = data.result?.[0]?.results?.[0]?.ethical_score || 100;
    const shopping_ethics = data.result?.[0]?.results?.[0]?.shopping_ethics || 100;
    const transport_ethics = data.result?.[0]?.results?.[0]?.transport_ethics || 100;
    const other_ethics = data.result?.[0]?.results?.[0]?.other_ethics || 100;
    
    const d = new Date();
    const day = d.getDate();
    const days = new Date(d.getFullYear(), (d.getMonth()+1), 0).getDate()
    // Placeholder for demonstration purposes not 0 will break!!!!
    const percentage_spent =  budget ? (total_spent / budget) * 100 : 0;



    const adjusted_percentage_spent = percentage_spent / (day / days);
    const remaining_budget = budget - total_spent;
    let budgetInfoColor = "text-[#65e2b9]";
    let budgetInfoBgColor = "bg-[#65e2b9]";
    if (adjusted_percentage_spent > 100) {
        budgetInfoColor = "text-red-500";
        budgetInfoBgColor = "bg-red-500";
    } else if (adjusted_percentage_spent > 75) {
        budgetInfoColor = "text-yellow-500";
        budgetInfoBgColor = "bg-yellow-500";
    } else if (adjusted_percentage_spent > 50) {
        budgetInfoColor = "text-[#65e2b9]";
        budgetInfoBgColor = "bg-[#65e2b9]";
    }

    let ethical_colour = "text-red-500";
    let ethical_border_colour = "border-red-500";
    if (ethics>=75){
        ethical_colour= "text-[#65e2b9]";
        ethical_border_colour = "border-[#65e2b9]";
    } else if(ethics >=38){
        ethical_colour="text-yellow-500";
        ethical_border_colour = "border-yellow-500";
    }
    const placeholder_text= "Generating Ethical Feedback..."
    let shopping_ethics_colour;
    let transport_ethics_colour;
    let other_ethics_colour;

    if(shopping_ethics>70){
        shopping_ethics_colour = "bg-[#65e2b9]";
    } else if(shopping_ethics>30){
        shopping_ethics_colour = "bg-yellow-500";
    } else{
        shopping_ethics_colour = "bg-red-500";
    }
    transport_ethics_colour = "bg-red-500";
    if(transport_ethics>70){
        transport_ethics_colour = "bg-[#65e2b9]";
    } else if(transport_ethics>30){
        transport_ethics_colour = "bg-yellow-500";
    } else{
        transport_ethics_colour = "bg-red-500";
    }

    if(other_ethics>70){
        other_ethics_colour = "bg-[#65e2b9]";
    } else if(other_ethics>30){
        other_ethics_colour = "bg-yellow-500";
    } else{
        other_ethics_colour = "bg-red-500";
    }
    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black relative">
            <div className="w-full max-w-3xl flex items-center justify-between py-4 px-4 sm:px-8 lg:px-16 bg-white dark:bg-black">
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="relative group">
                        {/* The button catches the focus when clicked */}
                        <button aria-label="Open Menu" className="focus:outline-none">
                            <Image
                                src="/hamburger.svg"
                                alt="hamburger menu"
                                className="dark:invert"
                                width={30}
                                height={30}
                                priority
                            />
                        </button>
                        
                        {/* CSS handles visibility using opacity and pointer-events */}
                        <div className="absolute top-10 left-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-md p-4 flex flex-col gap-3 w-48 z-10 
                                        opacity-0 pointer-events-none transition-opacity duration-150
                                        group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
                            <form action={logout}>
                                <button type="submit" className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-[#65e2b9]">
                                    Log out
                                </button>
                            </form>
                            <a href="/add-item" className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-[#65e2b9]">Add Payment</a>
                        </div>
                    </div>

                    <Image
                        src="/EKONOS.svg"
                        alt="EKONOS logo"
                        width={50}
                        height={50}
                        priority
                        className="w-10 h-10 sm:w-12.5 sm:h-12.5"
                    />
                </div>
                <p className="text-base sm:text-1xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 whitespace-nowrap">
                    Welcome, {name}!
                </p>
            </div>
            <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-between py-8 sm:py-15 px-4 sm:px-8 lg:px-16 bg-white dark:bg-black sm:items-start">
                <div className="flex flex-col sm:flex-row gap-4 justify-between w-full cursor-default">
                    <div id="budget-info" className="flex-1 flex flex-col gap-1 p-4 border border-zinc-200 rounded-lg bg-white dark:bg-zinc-900 hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]" >
                    <a href="/add-item">
                        <div className="text-xs font-medium text-zinc-500">Spent This Month</div>
                        <div className={`text-2xl font-bold ${budgetInfoColor}`}>£{total_spent}</div>
                        <div className="text-xs text-zinc-500">Out of £{budget}</div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                            <div
                                className={`h-full rounded-full ${budgetInfoBgColor}`}
                                style={{ width: `${Math.min(percentage_spent, 100)}%` }}
                            />
                        </div>
                        <div className="text-xs text-zinc-500">
                            {Math.min(percentage_spent, 100).toFixed(0)}% of budget used
                        </div>
                    </a>
                    </div>
                    
                    <div id="remaining-info" className="flex-1 flex flex-col gap-1 p-4 border border-zinc-200  rounded-lg bg-white dark:bg-zinc-900 hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] ">
                    <a href="/edit-budget">
                        <div className="text-xs font-medium text-zinc-500">Remaining Budget</div>
                        <div className={`text-2xl font-bold ${budgetInfoColor}`}>£{remaining_budget}</div>
                        <div className="text-xs text-zinc-500">{days-day} days left</div>
                    </a>
                    </div>
                    <div id="ethical-score" className="flex-1 flex flex-col gap-1 p-4 border border-zinc-200  rounded-lg bg-white dark:bg-zinc-900 hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] ">
                    <a href="/ethical-breakdown">
                        <div className="text-xs font-medium text-zinc-500">Ethical Score</div>
                        <div className={`text-2xl font-bold ${ethical_colour}`}>{ethics}</div>
                        <div className="text-xs text-zinc-500">out of 100</div>
                    </a>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full mt-4 cursor-default">
                    <div id="ethical-breakdown" className="mt-4 w-full p-4 border border-zinc-200  rounded-lg bg-white dark:bg-zinc-900 hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] ">
                        <p>Your Ethical Breakdown</p>
                        <div className="flex gap-3 max-w-xl">
                            <div className={`flex items-center justify-center w-14 h-14 rounded-full border-4 ${ethical_border_colour} text-base font-medium ${ethical_colour} shrink-0`}>{ethics}</div>
                            <div>{placeholder_text}</div>
                        </div>
                        <div>
                            <p>Shopping</p>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                <div
                                className={`h-full rounded-full ${shopping_ethics_colour}`}
                                style={{ width: `${Math.min(shopping_ethics, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <p>Transport</p>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                <div
                                className={`h-full rounded-full ${transport_ethics_colour}`}
                                style={{ width: `${Math.min(transport_ethics, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <p>Other</p>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                <div
                                className={`h-full rounded-full ${other_ethics_colour}`}
                                style={{ width: `${Math.min(other_ethics, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                    <div id="transactions" className="mt-4 w-full p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 hover:border-transparent hover:bg-black/4 dark:hover:bg-[#1a1a1a] ">
                        <p>Past Transactions</p>
                    </div>
                </div>
            </main> 
        </div>
    );
}
