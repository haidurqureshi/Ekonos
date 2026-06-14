'use client';

import { useState } from "react";
import Image from "next/image";

export default function HamburgerMenu() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button onClick={() => setOpen(!open)} aria-label="Open Menu">
                <Image
                    src="/hamburger.svg"
                    alt="hamburger menu"
                    className="dark:invert absolute left-3 top-3"
                    width={30}
                    height={30}
                    priority
                />
            </button>
            {open && (
                <div className="absolute top-12 left-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-md p-4 flex flex-col gap-3 w-48">
                    <a href="/dashboard" className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-[#65e2b9]">Dashboard</a>
                    <a href="/api/logout" className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-[#65e2b9]">Log out</a>
                </div>
            )}
        </>
    );
}