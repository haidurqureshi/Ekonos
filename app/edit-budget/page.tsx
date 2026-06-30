"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";


export default function SignupPage() {
    const router = useRouter();
    const [budget, SetPrice] = useState("");
    const [timescale, SetCategory] = useState("");
    const [error, setError] = useState<string | null>(null);
    let adjusted_budget : number = Number(budget);

    switch(timescale){
        case "Daily":
            adjusted_budget = adjusted_budget * 365 / 12;
        case "Weekly":
            adjusted_budget = adjusted_budget / 7 * 365 / 12; 
        case "Monthly":
            adjusted_budget = adjusted_budget; 
        case "Yearly":
            adjusted_budget = adjusted_budget / 12;

        
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if(!timescale || !budget ){
            setError("All fields are required");
            return;
        }

        fetch("/api/budget", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ adjusted_budget }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to add transaction");
                }
                return response.json();
            })
            .then(() => {
                router.push("/");
            })
            .catch((error) => {
                setError(error.message);
            });
    };

    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-15 px-16 bg-white dark:bg-black sm:items-start">
                <Image src="/EKONOS.svg" alt="EKONOS logo" width={100} height={100} priority />
                <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
                    <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                        Edit Your Budget
                    </h1>
                    <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">Track your spending by adding a budget</p>
                </div>
                <form className="flex flex-1 w-75 max-w-2xl flex-col gap-3" onSubmit={handleSubmit}>
                    <input
                        type="number"
                        placeholder="Income"
                        min = "0.00"
                        step={0.01}
                        value={budget}
                        onChange={(e) => SetPrice(e.target.value)}
                        required
                        className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#65e2b9] dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500"
                    />
                    <select value={timescale} onChange={(e) => SetCategory(e.target.value)} className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#65e2b9] dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500" required>
                        <option value="" disabled>Select category</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                    </select>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                        type="submit"
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-39.5 mt-4"
                    >
                        Add transaction
                    </button>
                </form>
            </main>
        </div>
    );
}
