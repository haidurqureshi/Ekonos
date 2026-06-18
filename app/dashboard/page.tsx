import Image from "next/image";
import HamburgerMenu from './HamburgerMenu';

export default async function Dashboard() {
    /*const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) redirect('/dashboard');
    
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
                'Authorization': `Bearer ${process.env.CF_API_TOKEN}`,
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
    */
   const d = new Date();
    let day = d.getDate();
   const days = new Date(d.getFullYear(), (d.getMonth()+1), 0).getDate()
   const name = "User"; // Placeholder for demonstration purposes
    const total_spent = 297; // Placeholder for demonstration purposes
    const budget = 1000; // Placeholder for demonstration purposes
    const percentage_spent = (total_spent / budget) * 100; // Placeholder for demonstration purposes
    let adjusted_percentage_spent = percentage_spent / (day / days);
    let remaining_budget = budget - total_spent;
    let budgetInfoColor = "text-green-500";
    let budgetInfoBgColor = "bg-green-500";
    if (adjusted_percentage_spent > 100) {
        budgetInfoColor = "text-red-500";
        budgetInfoBgColor = "bg-red-500";
    } else if (adjusted_percentage_spent > 75) {
        budgetInfoColor = "text-yellow-500";
        budgetInfoBgColor = "bg-yellow-500";
    } else if (adjusted_percentage_spent > 50) {
        budgetInfoColor = "text-green-500";
        budgetInfoBgColor = "bg-green-500";
    }
    let ethics =69;//placeholder
    let ethical_colour = "text-red-500";
    let ethical_border_colour = "border-red-500";
    if (ethics>=75){
        ethical_colour= "text-green-500";
        ethical_border_colour = "border-green-500";
    } else if(ethics >=38){
        ethical_colour="text-yellow-500";
        ethical_border_colour = "border-yellow-500";
    }
    let placeholder_text= "Most spending aligns with your values. Your score would rise by 6 points if shopping purchases shifted away from Shell."
    let shopping_ethics = 78;
    let transport_ethics  = 9;
    let other_ethics = 54;
    let shopping_ethics_colour;
    let transport_ethics_colour;
    let other_ethics_colour;

    if(shopping_ethics>70){
        shopping_ethics_colour = "bg-green-500";
    } else if(shopping_ethics>30){
        shopping_ethics_colour = "bg-yellow-500";
    } else{
        shopping_ethics_colour = "bg-red-500";
    }
    transport_ethics_colour = "bg-red-500";
    if(transport_ethics>70){
        transport_ethics_colour = "bg-green-500";
    } else if(transport_ethics>30){
        transport_ethics_colour = "bg-yellow-500";
    } else{
        transport_ethics_colour = "bg-red-500";
    }

    if(other_ethics>70){
        other_ethics_colour = "bg-green-500";
    } else if(other_ethics>30){
        other_ethics_colour = "bg-yellow-500";
    } else{
        other_ethics_colour = "bg-red-500";
    }
   return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black relative">
            <div className="w-full max-w-3xl flex items-center py-15 px-16 bg-white dark:bg-black sm:items-start relative">
                <div className="flex items-center gap-4 justify-start flex-start">
                        <HamburgerMenu />
                        <Image
                            src="/EKONOS.svg"
                            alt="EKONOS logo"
                            width={50}
                            height={40}
                            className="absolute top-1"
                            priority
                        />
                </div>
                <p className="absolute top-4 right-4 text-1xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 whitespace-nowrap">
                    Welcome, {name}!
                </p>
            </div>
            <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-between py-15 px-16 bg-white dark:bg-black sm:items-start">
                <div className="flex flex-row gap-4 justify-between w-full">
                    <div id="budget-info" className="flex-1 flex flex-col gap-1 p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
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
                    </div>
                    <div id="remaining-info" className="flex-1 flex flex-col gap-1 p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
                        <div className="text-xs font-medium text-zinc-500">Remaining Budget</div>
                        <div className={`text-2xl font-bold ${budgetInfoColor}`}>£{remaining_budget}</div>
                        <div className="text-xs text-zinc-500">{days-day} days left</div>
                    </div>
                    <div id="ethical-score" className="flex-1 flex flex-col gap-1 p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
                        <div className="text-xs font-medium text-zinc-500">Ethical Score</div>
                        <div className={`text-2xl font-bold ${ethical_colour}`}>{ethics}</div>
                        <div className="text-xs text-zinc-500">out of 100</div>
                    </div>
                </div>
                <div className="flex flex-row gap-4 justify-between w-full">
                    <div id="ethical-breakdown" className="mt-4 w-full p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
                        <p>Your Ethical Breakdown</p>
                        <div className="flex gap-3 max-w-xl">
                            <div className={`flex items-center justify-center w-14 h-14 rounded-full border-4 ${ethical_border_colour} text-base font-medium ${ethical_colour} flex-shrink-0`}>{ethics}</div>
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
                    <div id="transactions" className="mt-4 w-full p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
                        <p>Past Transactions</p>
                    </div>
                </div>
            </main> 
        </div>
    );
}