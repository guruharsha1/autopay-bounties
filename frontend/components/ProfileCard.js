"use client";

import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export default function ProfileCard() {
  const { publicKey } = useWallet();
  const [githubUsername, setGithubUsername] = useState("");
  const [status, setStatus] = useState("");
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  const walletAddress = useMemo(() => publicKey?.toBase58() || "", [publicKey]);

  const register = async (e) => {
    e.preventDefault();
    if (!walletAddress) {
      setStatus("Connect wallet first.");
      return;
    }
    try {
      setStatus("Registering...");
      const res = await fetch(`${apiBase}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github_username: githubUsername,
          wallet_address: walletAddress
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register");
      }
      setStatus("Mapping saved. You are ready for auto payout.");
      setGithubUsername("");
    } catch (error) {
      setStatus(`Failed: ${error.message}`);
    }
  };

  return (
    <div className="card space-y-3">
      <p>
        <span className="text-slate-400">Wallet: </span>
        <span className="break-all">{walletAddress || "Not connected"}</span>
      </p>
      <form className="space-y-2" onSubmit={register}>
        <label className="block text-sm text-slate-300">GitHub Username</label>
        <input
          className="w-full rounded border border-slate-700 bg-slate-950 p-2"
          value={githubUsername}
          onChange={(e) => setGithubUsername(e.target.value)}
          placeholder="your-github-handle"
          required
        />
        <button
          type="submit"
          className="rounded bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500"
        >
          Register Mapping
        </button>
      </form>
      {status ? <p className="text-sm text-slate-300">{status}</p> : null}
      <p className="text-xs text-slate-500">
        Earnings are visible in your wallet history on Solana Explorer.
      </p>
    </div>
  );
}
