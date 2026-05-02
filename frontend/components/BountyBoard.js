"use client";

import { useEffect, useState } from "react";
import { useAnchorProgram } from "@/lib/anchorClient";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function BountyBoard() {
  const program = useAnchorProgram();
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!program) return;
      setLoading(true);
      setError("");
      try {
        const all = await program.account.bounty.all();
        if (!cancelled) {
          setBounties(
            all.map((row) => ({
              address: row.publicKey.toBase58(),
              repo: row.account.repo,
              issueNumber: Number(row.account.issueNumber),
              amountSol: Number(row.account.amount) / LAMPORTS_PER_SOL,
              isPaid: row.account.isPaid
            }))
          );
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [program]);

  if (!program) {
    return <p className="text-slate-400">Connect wallet to load bounties.</p>;
  }

  if (loading) return <p>Loading bounties...</p>;
  if (error) return <p className="text-red-400">{error}</p>;
  if (bounties.length === 0) return <p className="text-slate-400">No bounties yet.</p>;

  return (
    <div className="space-y-3">
      {bounties.map((bounty) => (
        <div key={bounty.address} className="card">
          <p className="font-medium">{bounty.repo}</p>
          <p className="text-slate-300">Issue #{bounty.issueNumber}</p>
          <p className="text-emerald-300">{bounty.amountSol} SOL</p>
          <p className={bounty.isPaid ? "text-amber-300" : "text-cyan-300"}>
            {bounty.isPaid ? "Paid" : "Open"}
          </p>
        </div>
      ))}
    </div>
  );
}
