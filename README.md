# AutoPay Bounties (Solana + GitHub Webhooks)

Developers complete GitHub issues and automatically get paid in SOL when their PR is merged.

## Stack

- Frontend: Next.js (App Router), Tailwind CSS, Solana Wallet Adapter (Phantom)
- Backend: Node.js + Express + GitHub webhook endpoint
- Blockchain: Solana Devnet + Anchor

## Project Structure

- `anchor/` - Anchor smart contract
- `backend/` - webhook server + payout trigger
- `frontend/` - web app (bounty board, create bounty, profile)

## 1) Deploy the Anchor Program

1. Install Rust, Solana CLI, and Anchor.
2. Set devnet:
   - `solana config set --url devnet`
3. Build and deploy:
   - `cd anchor`
   - `anchor build`
   - `anchor deploy`
4. Copy the deployed program id and update:
   - `anchor/Anchor.toml`
   - `anchor/programs/autopay_bounties/src/lib.rs` (`declare_id!`)
   - `frontend/.env.local` (`NEXT_PUBLIC_PROGRAM_ID`)
   - `backend/.env` (`PROGRAM_ID`)
5. Replace `shared/autopay_bounties_idl.json` with generated
   `anchor/target/idl/autopay_bounties.json` after `anchor build`.

## 2) Run Backend

1. `cd backend`
2. `npm install`
3. Create `.env` from `.env.example`
4. Set:
   - `RPC_URL` (devnet)
   - `PROGRAM_ID`
   - `BACKEND_AUTHORITY_SECRET` (JSON array keypair)
   - `GITHUB_WEBHOOK_SECRET` (optional but recommended)
5. `npm run dev`

## 3) Run Frontend

1. `cd frontend`
2. `npm install`
3. Create `.env.local` from `.env.example`
4. Set:
   - `NEXT_PUBLIC_RPC_URL`
   - `NEXT_PUBLIC_PROGRAM_ID`
   - `NEXT_PUBLIC_BACKEND_AUTHORITY` (public key of backend authority)
   - `NEXT_PUBLIC_API_BASE` (e.g. `http://localhost:4000`)
5. `npm run dev`

## 4) GitHub Webhook

Create a webhook for your test repository:

- URL: `http://<your-host>/webhook`
- Content type: `application/json`
- Secret: same as `GITHUB_WEBHOOK_SECRET`
- Events: `Pull requests`

PR body convention for issue extraction:

- Include text like `Fixes #42` (or `Closes #42`, `Resolves #42`)

## Demo Flow

1. Connect Phantom wallet.
2. Create bounty for `owner/repo` + issue number + SOL amount.
3. Register your GitHub username to wallet in Profile page.
4. Merge a PR with `Fixes #<issue_number>` in body.
5. Webhook hits backend.
6. Backend finds matching unpaid bounty and calls `release_payment`.
7. Funds are transferred to registered developer wallet.
