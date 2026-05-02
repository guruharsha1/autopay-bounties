"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function NavBar() {
  return (
    <header className="border-b border-slate-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">
            AutoPay Bounties
          </Link>
          <Link href="/create" className="text-slate-300 hover:text-white">
            Create
          </Link>
          <Link href="/profile" className="text-slate-300 hover:text-white">
            Profile
          </Link>
        </div>
        <WalletMultiButton />
      </div>
    </header>
  );
}
