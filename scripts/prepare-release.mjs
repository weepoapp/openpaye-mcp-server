import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const allowed = new Set(["patch", "minor", "major"]);
const bump = process.argv[2] ?? "patch";

if (!allowed.has(bump)) {
  process.stderr.write("Usage: npm run release:prepare -- [patch|minor|major]\n");
  process.exit(1);
}

const root = process.cwd();
const pkgPath = path.join(root, "package.json");
const manifestPath = path.join(root, "manifest.json");
const serverJsonPath = path.join(root, "server.json");

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const [major, minor, patch] = String(pkg.version)
  .split(".")
  .map((v) => Number(v));

const next =
  bump === "major"
    ? `${major + 1}.0.0`
    : bump === "minor"
      ? `${major}.${minor + 1}.0`
      : `${major}.${minor}.${patch + 1}`;

pkg.version = next;
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.version = next;
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const serverJson = JSON.parse(fs.readFileSync(serverJsonPath, "utf8"));
serverJson.version = next;
fs.writeFileSync(serverJsonPath, `${JSON.stringify(serverJson, null, 2)}\n`);

execSync("npm run package:mcpb", { stdio: "inherit" });

process.stdout.write(`Prepared release v${next}\n`);
process.stdout.write("Next steps:\n");
process.stdout.write("1) git add .\n");
process.stdout.write(`2) git commit -m "release: v${next}"\n`);
process.stdout.write(`3) git tag v${next}   (ou: npm run release:tag - lit package.json)\n`);
process.stdout.write(`4) git push origin <ta-branche> && git push origin v${next}\n`);
process.stdout.write("\nNote: release.yml GitHub Actions ne tourne que sur push du tag v* (pas sur un push sans tag).\n");
process.stdout.write("Sans tag: declencher a la main via Actions > Release > Run workflow (workflow_dispatch).\n");
