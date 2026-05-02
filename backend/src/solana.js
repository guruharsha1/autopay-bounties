import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import dotenv from "dotenv";
import idl from "../../shared/autopay_bounties_idl.json" with { type: "json" };

dotenv.config();

const RPC_URL = process.env.RPC_URL;
const PROGRAM_ID = process.env.PROGRAM_ID;
const BACKEND_AUTHORITY_SECRET = process.env.BACKEND_AUTHORITY_SECRET;

if (!RPC_URL || !PROGRAM_ID || !BACKEND_AUTHORITY_SECRET) {
  throw new Error("Missing RPC_URL, PROGRAM_ID, or BACKEND_AUTHORITY_SECRET in .env");
}

const connection = new anchor.web3.Connection(RPC_URL, "confirmed");
const authoritySecret = Uint8Array.from(JSON.parse(BACKEND_AUTHORITY_SECRET));
const authority = Keypair.fromSecretKey(authoritySecret);
const wallet = new anchor.Wallet(authority);
const provider = new anchor.AnchorProvider(connection, wallet, {
  commitment: "confirmed"
});

const program = new anchor.Program(idl, new PublicKey(PROGRAM_ID), provider);

export async function findOpenBounty(repo, issueNumber) {
  const all = await program.account.bounty.all();
  return all.find((entry) => {
    return (
      entry.account.repo === repo &&
      Number(entry.account.issueNumber) === Number(issueNumber) &&
      !entry.account.isPaid
    );
  });
}

export async function releaseBountyPayment(bountyPubkey, issueNumber, developerWallet) {
  const dev = new PublicKey(developerWallet);
  const sig = await program.methods
    .releasePayment(new anchor.BN(issueNumber), dev)
    .accounts({
      authority: authority.publicKey,
      bounty: bountyPubkey,
      developer: dev,
      systemProgram: SystemProgram.programId
    })
    .rpc();
  return sig;
}

export function getAuthorityPublicKey() {
  return authority.publicKey.toBase58();
}
