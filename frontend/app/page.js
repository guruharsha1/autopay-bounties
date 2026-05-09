import Link from "next/link";
import BountyBoard from "@/components/BountyBoard";

const steps = [
  {
    title: "Create a bounty",
    copy: "Fund a GitHub issue with SOL and lock it in a Solana escrow PDA."
  },
  {
    title: "Merge the fix",
    copy: "A GitHub webhook watches merged pull requests that reference the issue."
  },
  {
    title: "Pay the developer",
    copy: "The backend authority releases escrow to the wallet mapped to the PR author."
  }
];

export default function HomePage() {
  return (
    <div className="space-y-14">
      <section className="relative isolate -mx-4 overflow-hidden px-4 py-16 sm:px-8 lg:px-12">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1800&q=80')"
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 bg-slate-950/80" aria-hidden="true" />

        <div className="max-w-3xl py-10">
          <p className="mb-4 text-sm font-semibold uppercase text-cyan-300">
            Solana-powered GitHub bounties
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
            AutoPay Bounties
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
            Fund open-source issues, detect merged pull requests, and release escrowed SOL to the
            contributor wallet mapped to their GitHub username.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/create"
              className="rounded bg-cyan-500 px-5 py-3 font-medium text-slate-950 hover:bg-cyan-400"
            >
              Create Bounty
            </Link>
            <Link
              href="/profile"
              className="rounded border border-white/25 px-5 py-3 font-medium text-white hover:border-white/60"
            >
              Register Wallet
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="card">
            <p className="text-sm font-semibold text-cyan-300">0{index + 1}</p>
            <h2 className="mt-3 text-xl font-semibold">{step.title}</h2>
            <p className="mt-2 leading-7 text-slate-400">{step.copy}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Live Bounties</h2>
            <p className="mt-2 text-slate-400">
              Open bounties are paid automatically when a matching PR is merged.
            </p>
          </div>
          <Link href="/create" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
            Add a bounty
          </Link>
        </div>
        <BountyBoard />
      </section>
    </div>
  );
}
