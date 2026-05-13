import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

await esbuild.build({
  absWorkingDir: rootDir,
  entryPoints: ["dist/index.js"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  outfile: "dist/mcp-main.cjs",
  logLevel: "info",
});

process.stdout.write(`${path.join(rootDir, "dist", "mcp-main.cjs")}\n`);
