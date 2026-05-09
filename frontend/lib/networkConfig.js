"use client";

const DEFAULT_CLUSTER = "devnet";
const DEFAULT_DEVNET_RPC_URL = "https://api.devnet.solana.com";
const DEFAULT_MAINNET_RPC_URL = "https://api.mainnet-beta.solana.com";

function normalizeCluster(cluster) {
  if (cluster === "mainnet" || cluster === "mainnet-beta") return "mainnet-beta";
  return DEFAULT_CLUSTER;
}

export const SOLANA_CLUSTER = normalizeCluster(process.env.NEXT_PUBLIC_SOLANA_CLUSTER);

export function getRpcUrl() {
  if (SOLANA_CLUSTER === "mainnet-beta") {
    return (
      process.env.NEXT_PUBLIC_MAINNET_RPC_URL ||
      process.env.NEXT_PUBLIC_RPC_URL ||
      DEFAULT_MAINNET_RPC_URL
    );
  }

  return (
    process.env.NEXT_PUBLIC_DEVNET_RPC_URL ||
    process.env.NEXT_PUBLIC_RPC_URL ||
    DEFAULT_DEVNET_RPC_URL
  );
}

export function getProgramId() {
  const programId =
    SOLANA_CLUSTER === "mainnet-beta"
      ? process.env.NEXT_PUBLIC_MAINNET_PROGRAM_ID
      : process.env.NEXT_PUBLIC_DEVNET_PROGRAM_ID;

  return programId || process.env.NEXT_PUBLIC_PROGRAM_ID;
}
