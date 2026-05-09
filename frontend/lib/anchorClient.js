"use client";

import { useMemo } from "react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import idl from "../../anchor/target/idl/autopay_bounties.json";
import { getProgramId } from "@/lib/networkConfig";

const configuredProgramId = getProgramId();
if (!configuredProgramId) {
  throw new Error("Missing frontend program ID for selected Solana cluster");
}

const PROGRAM_ID = new PublicKey(configuredProgramId);

export function useAnchorProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) return null;

    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: "confirmed"
    });

    return new anchor.Program(idl, provider);
  }, [connection, wallet]);
}

export function getBountyPda(creator, issueNumber) {
  const issueBn = new anchor.BN(issueNumber);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("bounty"),
      creator.toBuffer(),
      issueBn.toArrayLike(Buffer, "le", 8)
    ],
    PROGRAM_ID
  );
}

export async function initializeBounty(program, walletPubkey, payload) {
  const issueNumber = Number(payload.issueNumber);
  const amountLamports = Math.floor(Number(payload.amountSol) * anchor.web3.LAMPORTS_PER_SOL);
  const authority = new PublicKey(process.env.NEXT_PUBLIC_BACKEND_AUTHORITY);
  const [bountyPda] = getBountyPda(walletPubkey, issueNumber);

  return program.methods
    .initializeBounty(
      payload.repo,
      new anchor.BN(issueNumber),
      new anchor.BN(amountLamports),
      authority
    )
    .accounts({
      creator: walletPubkey,
      bounty: bountyPda,
      systemProgram: SystemProgram.programId
    })
    .rpc();
}
