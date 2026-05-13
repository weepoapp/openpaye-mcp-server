import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { bumpSemver, readPackageVersion, syncProjectVersion } from "./lib/project-version.mjs";

const allowed = new Set(["patch", "minor", "major"]);
const bump = process.argv[2] ?? "patch";

if (!allowed.has(bump)) {
  process.stderr.write("Usage: npm run release:prepare -- [patch|minor|major]\n");
  process.exit(1);
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const current = readPackageVersion(root);
const next = bumpSemver(current, bump);

syncProjectVersion(root, next);

execSync("npm run package:mcpb", { cwd: root, stdio: "inherit" });

process.stdout.write(`Prepared release v${next}\n`);
process.stdout.write("Next steps:\n");
process.stdout.write("1) git add .\n");
process.stdout.write(`2) git commit -m "release: v${next}"\n`);
process.stdout.write(`3) git tag v${next}\n`);
process.stdout.write(`4) git push origin <ta-branche> && git push origin v${next}\n`);
process.stdout.write("\nNote: release.yml GitHub Actions ne tourne que sur push du tag v* (pas sur un push sans tag).\n");
process.stdout.write("Sans tag: declencher a la main via Actions > Release > Run workflow (workflow_dispatch).\n");
