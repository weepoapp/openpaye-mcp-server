import fs from "node:fs";
import path from "node:path";
import archiver from "archiver";

const rootDir = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
const outputDir = path.join(rootDir, "release");
const outputPath = path.join(outputDir, `openpaye-mcp-server-${pkg.version}.mcpb`);

fs.mkdirSync(outputDir, { recursive: true });

const output = fs.createWriteStream(outputPath);
const archive = archiver("zip", { zlib: { level: 9 } });

archive.pipe(output);
archive.directory(path.join(rootDir, "dist"), "dist");
archive.file(path.join(rootDir, "manifest.json"), { name: "manifest.json" });
archive.file(path.join(rootDir, "README.md"), { name: "README.md" });
archive.file(path.join(rootDir, "LICENSE"), { name: "LICENSE" });
archive.file(path.join(rootDir, "NOTICE"), { name: "NOTICE" });

archive.finalize();

await new Promise((resolve, reject) => {
  output.on("close", resolve);
  output.on("error", reject);
});

process.stdout.write(`${outputPath}\n`);
