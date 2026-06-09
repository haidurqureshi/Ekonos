"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if(!name || !email || !password){
            setError("All fields are required");
            return;
        }

        fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to create account");
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
                        Welcome to Ekonos Signup Page
                    </h1>
                    <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">Create an account to start budgeting</p>
                </div>
                <form className="flex flex-1 w-75 max-w-2xl flex-col gap-3" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#65e2b9] dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#65e2b9] dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#65e2b9] dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500"
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#65e2b9] dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500"
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                        type="submit"
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px] mt-4"
                    >
                        Sign Up
                    </button>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Already have an account? {" "}
                        <a href="/login" className="text-[#65e2b9] hover:underline">
                            Log in
                        </a>
                    </p>
                </form>
            </main>
        </div>
    );
}