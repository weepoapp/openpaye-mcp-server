/**
 * Hook pre-push : pas de "post-push" en Git — on agit juste avant l'envoi au remote.
 * Si activé (package.json config.huskyAutoTag) et push de la branche principale,
 * crée le tag v<version> (package.json) s'il manque et le pousse vers origin.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

if (pkg.config?.huskyAutoTag !== true) {
  process.exit(0);
}

const stdin = readFileSync(0, "utf8").trim();
if (!stdin) {
  process.exit(0);
}

const lines = stdin.split("\n").map((l) => l.trim()).filter(Boolean);

const allTagPushes = lines.every((line) => {
  const remoteRef = line.split(/\s+/)[2];
  return typeof remoteRef === "string" && remoteRef.startsWith("refs/tags/");
});
if (allTagPushes) {
  process.exit(0);
}

const branch = process.env.HUSKY_AUTO_TAG_BRANCH ?? "main";
const branchRef = `refs/heads/${branch}`;
const pushesBranch = lines.some((line) => {
  const localRef = line.split(/\s+/)[0];
  return localRef === branchRef;
});
if (!pushesBranch) {
  process.exit(0);
}

const version = pkg.version;
const tag = `v${version}`;

let hasLocalTag = true;
try {
  execSync(`git rev-parse -q --verify refs/tags/${tag}`, { cwd: root, stdio: "pipe" });
} catch {
  hasLocalTag = false;
}

if (!hasLocalTag) {
  execSync(`git tag ${tag}`, { cwd: root, stdio: "inherit" });
  process.stderr.write(`[husky] Tag cree: ${tag}\n`);
} else {
  const tagCommit = execSync(`git rev-parse ${tag}^{}`, { cwd: root, encoding: "utf8" }).trim();
  const headCommit = execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
  if (tagCommit !== headCommit) {
    process.stderr.write(
      `[husky] Tag ${tag} pointe sur ${tagCommit.slice(0, 7)}, HEAD est ${headCommit.slice(0, 7)} — pas de push auto du tag.\n`,
    );
    process.exit(0);
  }
}

const remoteOut = execSync(`git ls-remote --tags origin refs/tags/${tag}`, {
  cwd: root,
  encoding: "utf8",
}).trim();
if (remoteOut.length > 0) {
  process.exit(0);
}

process.stderr.write(`[husky] Push du tag ${tag} vers origin…\n`);
execSync(`git push origin ${tag}`, {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, HUSKY: "0" },
});
