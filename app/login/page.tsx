import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
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
                    Welcome to Ekonos Login Page
                </h1>
                <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                    Log in to your account to start budgeting
                </p>
            </div>
            <form className="flex flex-1 w-75 max-w-2xl flex-col gap-3">
                <input
                    type="email"
                    placeholder="Email"
                    className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#65e2b9] dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500"
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#65e2b9] dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500"
                />
                <button
                    type="submit"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px] mt-4"
                >
                    Log In
                </button>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Don't have an account?{" "}
                    <a href="/signup" className="text-[#65e2b9] hover:underline">
                        Sign up
                    </a>
                </p>
            </form>
        
        </main>
    </div>
  );
}