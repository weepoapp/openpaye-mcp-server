import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const version = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
const tag = `v${version}`;

try {
  execSync(`git rev-parse -q --verify refs/tags/${tag}`, { stdio: "pipe" });
  process.stderr.write(`Tag ${tag} existe deja. Pour le recreer: git tag -d ${tag}\n`);
  process.exit(1);
} catch {
  // tag absent: OK
}

execSync(`git tag ${tag}`, { stdio: "inherit" });
process.stdout.write(`\nTag cree: ${tag}\n`);
process.stdout.write(`Declencher la CI release: git push origin ${tag}\n`);
process.stdout.write(`(Un simple git push sans tag ne lance pas release.yml.)\n\n`);
