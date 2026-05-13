import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

/**
 * @param {string} version "0.1.0"
 * @param {"patch" | "minor" | "major"} level
 */
export function bumpSemver(version, level) {
  const m = String(version).trim().match(SEMVER);
  if (!m) {
    throw new Error(`Version semver X.Y.Z attendue, recu: ${version}`);
  }
  let major = Number(m[1]);
  let minor = Number(m[2]);
  let patch = Number(m[3]);
  if (level === "major") {
    return `${major + 1}.0.0`;
  }
  if (level === "minor") {
    return `${major}.${minor + 1}.0`;
  }
  return `${major}.${minor}.${patch + 1}`;
}

/** @param {string} a "0.1.0" @param {string} b */
export function compareSemver(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) {
      return pa[i] - pb[i];
    }
  }
  return 0;
}

/**
 * Dernier tag vX.Y.Z (semver strict) sur le depo local, par tri semver decroissant.
 * @param {string} root
 * @returns {string | null} ex. "v0.2.0"
 */
export function getLatestSemverTag(root) {
  let out = "";
  try {
    out = execSync('git tag -l "v*.*.*"', { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
  const tags = out
    .split("\n")
    .map((t) => t.trim())
    .filter((t) => /^v\d+\.\d+\.\d+$/.test(t));
  if (tags.length === 0) {
    return null;
  }
  tags.sort((x, y) => compareSemver(y.slice(1), x.slice(1)));
  return tags[0];
}

/**
 * @param {string} root
 * @param {string} version sans prefixe v
 */
export function syncProjectVersion(root, version) {
  const pkgPath = path.join(root, "package.json");
  const manifestPath = path.join(root, "manifest.json");
  const serverJsonPath = path.join(root, "server.json");

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  pkg.version = version;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.version = version;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const serverJson = JSON.parse(fs.readFileSync(serverJsonPath, "utf8"));
  serverJson.version = version;
  fs.writeFileSync(serverJsonPath, `${JSON.stringify(serverJson, null, 2)}\n`);

  const constantsPath = path.join(root, "src", "constants.ts");
  if (fs.existsSync(constantsPath)) {
    let src = fs.readFileSync(constantsPath, "utf8");
    const nextSrc = src.replace(
      /export const SERVER_VERSION = "[^"]*";/,
      `export const SERVER_VERSION = "${version}";`,
    );
    if (nextSrc !== src) {
      fs.writeFileSync(constantsPath, nextSrc);
    }
  }
}

export function readPackageVersion(root) {
  const pkgPath = path.join(root, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  return String(pkg.version);
}
