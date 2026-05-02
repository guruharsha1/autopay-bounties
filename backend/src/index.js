import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { getAllMappings, getWalletForGithubUser, registerMapping } from "./state.js";
import {
  findOpenBounty,
  getAuthorityPublicKey,
  releaseBountyPayment
} from "./solana.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "";

app.use(cors());
app.use(express.json({ verify: rawBodySaver }));

function rawBodySaver(req, _res, buf) {
  req.rawBody = buf;
}

function verifyGithubSignature(req) {
  if (!WEBHOOK_SECRET) return true;
  const signature = req.headers["x-hub-signature-256"];
  if (!signature || !req.rawBody) return false;
  const hash = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest("hex");
  const expected = `sha256=${hash}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function extractIssueNumber(prBody = "") {
  const regex = /(fixes|closes|resolves)\s+#(\d+)/i;
  const match = prBody.match(regex);
  return match ? Number(match[2]) : null;
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    authority: getAuthorityPublicKey()
  });
});

app.get("/mappings", (_req, res) => {
  res.json(getAllMappings());
});

app.post("/register", (req, res) => {
  const { github_username, wallet_address } = req.body;
  if (!github_username || !wallet_address) {
    return res.status(400).json({ error: "github_username and wallet_address are required" });
  }
  registerMapping(github_username, wallet_address);
  return res.json({ ok: true });
});

app.post("/webhook", async (req, res) => {
  try {
    if (!verifyGithubSignature(req)) {
      return res.status(401).json({ error: "Invalid webhook signature" });
    }

    const event = req.headers["x-github-event"];
    if (event !== "pull_request") {
      return res.json({ ignored: true, reason: "Not a pull_request event" });
    }

    const payload = req.body;
    const isMerged =
      payload?.action === "closed" && payload?.pull_request?.merged === true;
    if (!isMerged) {
      return res.json({ ignored: true, reason: "PR not merged" });
    }

    const repo = payload.repository?.full_name;
    const issueNumber = extractIssueNumber(payload.pull_request?.body || "");
    const githubUsername = payload.pull_request?.user?.login;

    if (!repo || !issueNumber || !githubUsername) {
      return res.status(400).json({
        error: "Missing repo, issue number from PR body, or github username"
      });
    }

    const developerWallet = getWalletForGithubUser(githubUsername);
    if (!developerWallet) {
      return res.status(404).json({
        error: `No wallet mapping found for GitHub user ${githubUsername}`
      });
    }

    const bounty = await findOpenBounty(repo, issueNumber);
    if (!bounty) {
      return res.status(404).json({
        error: `No unpaid bounty found for ${repo} #${issueNumber}`
      });
    }

    const signature = await releaseBountyPayment(
      bounty.publicKey,
      issueNumber,
      developerWallet
    );

    return res.json({
      ok: true,
      tx: signature,
      repo,
      issueNumber,
      paidTo: developerWallet
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`AutoPay backend listening on http://localhost:${PORT}`);
});
