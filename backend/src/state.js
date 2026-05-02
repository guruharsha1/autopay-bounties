import fs from "fs";
import path from "path";

const dataDir = path.resolve(process.cwd(), "data");
const mappingFile = path.join(dataDir, "github_wallet_map.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readMappings() {
  if (!fs.existsSync(mappingFile)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(mappingFile, "utf-8"));
  } catch {
    return {};
  }
}

function writeMappings(mappings) {
  fs.writeFileSync(mappingFile, JSON.stringify(mappings, null, 2));
}

let githubWalletMap = readMappings();

export function getAllMappings() {
  return githubWalletMap;
}

export function registerMapping(username, wallet) {
  githubWalletMap[username.toLowerCase()] = wallet;
  writeMappings(githubWalletMap);
}

export function getWalletForGithubUser(username) {
  return githubWalletMap[username.toLowerCase()];
}
