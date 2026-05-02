"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { initializeBounty, useAnchorProgram } from "@/lib/anchorClient";

export default function CreateBountyForm() {
  const { publicKey } = useWallet();
  const program = useAnchorProgram();
  const [repo, setRepo] = useState("");
  const [issueNumber, setIssueNumber] = useState("");
  const [amountSol, setAmountSol] = useState("");
  const [status, setStatus] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!publicKey || !program) {
      setStatus("Connect wallet first.");
      return;
    }
    try {
      setStatus("Creating bounty...");
      const tx = await initializeBounty(program, publicKey, {
        repo,
        issueNumber,
        amountSol
      });
      setStatus(`Bounty created. Tx: ${tx}`);
      setRepo("");
      setIssueNumber("");
      setAmountSol("");
    } catch (error) {
      setStatus(`Failed: ${error.message}`);
    }
  };

  return (
    <form className="card space-y-3" onSubmit={onSubmit}>
      <div>
        <label className="mb-1 block text-sm text-slate-300">GitHub Repo (owner/repo)</label>
        <input
          className="w-full rounded border border-slate-700 bg-slate-950 p-2"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="octocat/hello-world"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">Issue Number</label>
        <input
          type="number"
          className="w-full rounded border border-slate-700 bg-slate-950 p-2"
          value={issueNumber}
          onChange={(e) => setIssueNumber(e.target.value)}
          placeholder="42"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">Reward (SOL)</label>
        <input
          type="number"
          step="0.01"
          className="w-full rounded border border-slate-700 bg-slate-950 p-2"
          value={amountSol}
          onChange={(e) => setAmountSol(e.target.value)}
          placeholder="0.1"
          required
        />
      </div>
      <button
        type="submit"
        className="rounded bg-cyan-600 px-4 py-2 font-medium hover:bg-cyan-500"
      >
        Create Bounty
      </button>
      {status ? <p className="text-sm text-slate-300">{status}</p> : null}
    </form>
  );
}
