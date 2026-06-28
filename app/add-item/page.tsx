"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const [brand, SetBrand] = useState("");
    const [price, SetPrice] = useState("");
    const [category, SetCategory] = useState("");
    const [ethical_score, SetEthical_Score] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if(!brand || !price  || !ethical_score){
            setError("All fields are required");
            return;
        }

        fetch("/api/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ brand, price, category, ethical_score }),
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
                        Add a Transaction
                    </h1>
                    <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">Track your spending by adding a transaction</p>
                </div>
                <form className="flex flex-1 w-75 max-w-2xl flex-col gap-3" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Brand"
                        value={brand}
                        onChange={(e) => SetBrand(e.target.value)}
                        required
                        className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#65e2b9] dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500"
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        min = "0.00"
                        max= "Infinity"
                        step={0.01}
                        value={price}
                        onChange={(e) => SetPrice(e.target.value)}
                        required
                        className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#65e2b9] dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500"
                    />
                    <select
                        value={category}
                        onChange={(e) => SetCategory(e.target.value)}
                        className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#65e2b9] dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500"
                    >
                        <option>Transport</option>
                        <option>Shopping</option>
                        <option>Other</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Ethical Score"
                        step={1}
                        min={0}
                        max={100}
                        value={ethical_score}
                        onChange={(e) => SetEthical_Score(e.target.value)}
                        className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#65e2b9] dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500"
                    />
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