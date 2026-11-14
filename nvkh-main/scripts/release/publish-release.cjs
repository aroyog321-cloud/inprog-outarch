#!/usr/bin/env node
"use strict";

// Builds, signs and (optionally) publishes an OUTARCH release for the
// auto-updater.
//
//   1. Bump "version" in package.json (the updater checks the archive's own
//      package.json against the signed version).
//   2. node scripts/release/publish-release.cjs --notes "What changed"
//        builds the renderer, packs release/OUTARCH-<version>.zip, signs its
//        manifest and writes release/OUTARCH-<version>.release.json.
//   3. Add --upload to also put the ZIP in the Supabase "releases" bucket and
//      insert the app_releases row. That needs the project's service role key
//      in the environment (never in a file in this repository):
//        set SUPABASE_SERVICE_ROLE_KEY=<service role key>
//
// Options: --version <x.y.z> (checked against package.json), --notes <text>,
//          --notes-file <path>, --channel <stable>, --key <private key path>,
//          --skip-build, --mandatory, --upload
//
// Every installed OUTARCH verifies the signature with the public key built
// into it, so a release signed with any other key is ignored.

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { canonicalUpdate, verifyUpdateManifest } = require("../../src/service/updateVerifier.cjs");
const { UPDATE_PUBLIC_KEY } = require("../../src/service/updateConfig.cjs");
const { cloudConfig } = require("../../src/service/cloudConfig.cjs");

const root = path.resolve(__dirname, "..", "..");
const argv = process.argv.slice(2);
const flag = name => argv.includes(`--${name}`);
const option = (name, fallback = null) => {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 && argv[index + 1] && !argv[index + 1].startsWith("--") ? argv[index + 1] : fallback;
};
const fail = message => { console.error(`\n${message}`); process.exit(1); };

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = option("version", pkg.version);
if (version !== pkg.version) fail(`--version ${version} does not match package.json (${pkg.version}). Bump package.json first.`);
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) fail(`"${version}" is not a release version.`);
const channel = String(option("channel", "stable")).replace(/[^a-z0-9._-]/gi, "") || "stable";
const notes = option("notes-file") ? fs.readFileSync(path.resolve(option("notes-file")), "utf8") : option("notes", "");
const keyPath = path.resolve(option("key", path.join(os.homedir(), ".outarch", "release-signing-key.pem")));
if (!fs.existsSync(keyPath)) fail(`No signing key at ${keyPath}. Create one with: node scripts/release/generate-signing-key.cjs`);
const privateKey = crypto.createPrivateKey(fs.readFileSync(keyPath));
if (privateKey.asymmetricKeyType !== "ed25519") fail("The signing key must be Ed25519.");
const publicFromKey = crypto.createPublicKey(privateKey).export({ type: "spki", format: "pem" }).toString().trim();
if (publicFromKey !== UPDATE_PUBLIC_KEY.trim()) fail("This signing key does not match UPDATE_PUBLIC_KEY in src/service/updateConfig.cjs, so installed apps would reject the release.");

// ------------------------------------------------------------------ build
if (!flag("skip-build")) {
  console.log("Building the renderer…");
  execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "groundstation:build"], { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
}

// ------------------------------------------------------------------ stage
const name = `OUTARCH-${version}`;
const outDir = path.join(root, "release");
const stage = path.join(outDir, name);
fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });

// What ships: package.json "files", plus the manifest and lock the launcher needs.
const entries = [...new Set([...(pkg.files || []), "package.json", "package-lock.json"])];
// Build outputs and caches that must never ship.
const EXCLUDE = [/[\\/]node_modules([\\/]|$)/, /[\\/]\.gradle([\\/]|$)/, /[\\/]build([\\/]|$)/, /[\\/]\.git([\\/]|$)/, /\.vsix$/, /[\\/]local\.properties$/];
for (const entry of entries) {
  const source = path.join(root, entry);
  if (!fs.existsSync(source)) { console.warn(`  skipped (missing): ${entry}`); continue; }
  fs.cpSync(source, path.join(stage, entry), { recursive: true, filter: file => !EXCLUDE.some(pattern => pattern.test(file.slice(root.length))) });
}
// The VS Code extension ships inside the download (the website and README say
// so). Stale packages are excluded above; the current one is built fresh here so
// it always matches integrations/vscode.
const { build: buildVsix } = require("../package-vsix.cjs");
const vsix = buildVsix();
fs.mkdirSync(path.join(stage, "integrations", "vscode"), { recursive: true });
fs.copyFileSync(vsix, path.join(stage, "integrations", "vscode", path.basename(vsix)));
console.log(`  included ${path.basename(vsix)}`);

// ------------------------------------------------------------------ pack
const fileName = `${name}.zip`;
const archive = path.join(outDir, fileName);
fs.rmSync(archive, { force: true });
console.log(`Packing ${fileName}…`);
if (process.platform === "win32") {
  execFileSync(path.join(process.env.SystemRoot || "C:\\Windows", "System32", "tar.exe"), ["-a", "-c", "-f", archive, "-C", outDir, name], { stdio: "inherit" });
} else {
  execFileSync("zip", ["-qr", archive, name], { cwd: outDir, stdio: "inherit" });
}
const bytes = fs.readFileSync(archive);
const size = bytes.length;
if (size > 50 * 1024 * 1024) console.warn(`\nWarning: the archive is ${(size / 1048576).toFixed(1)} MB. The Supabase free plan refuses uploads over 50 MB.`);

// ------------------------------------------------------------------ sign
const manifest = {
  manifestVersion: 1,
  version,
  fileName,
  sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
  size,
  publishedAt: new Date().toISOString()
};
const signature = crypto.sign(null, Buffer.from(canonicalUpdate(manifest)), privateKey).toString("base64url");
verifyUpdateManifest({ ...manifest, signature }, UPDATE_PUBLIC_KEY);

const cloud = cloudConfig();
const row = {
  version,
  channel,
  notes: String(notes || "").slice(0, 4000),
  download_url: `${cloud.supabaseUrl}/storage/v1/object/public/releases/${encodeURIComponent(fileName)}`,
  file_name: fileName,
  sha256: manifest.sha256,
  size_bytes: size,
  signature,
  manifest,
  published_at: manifest.publishedAt,
  mandatory: flag("mandatory"),
  enabled: true
};
fs.writeFileSync(path.join(outDir, `${name}.release.json`), `${JSON.stringify(row, null, 2)}\n`);
fs.rmSync(stage, { recursive: true, force: true });
console.log(`\nSigned ${fileName} (${(size / 1048576).toFixed(1)} MB, sha256 ${manifest.sha256.slice(0, 12)}…)`);
console.log(`Release record: release/${name}.release.json`);

// ------------------------------------------------------------------ publish
async function publish() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.OUTARCH_SUPABASE_SERVICE_KEY;
  if (!serviceKey) fail("--upload needs SUPABASE_SERVICE_ROLE_KEY in the environment.");
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
  console.log("Uploading to the releases bucket…");
  const upload = await fetch(`${cloud.supabaseUrl}/storage/v1/object/releases/${encodeURIComponent(fileName)}`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/zip", "x-upsert": "true" },
    body: bytes
  });
  if (!upload.ok) fail(`Upload failed (${upload.status}): ${await upload.text()}`);
  console.log("Recording the release…");
  const insert = await fetch(`${cloud.supabaseUrl}/rest/v1/app_releases?on_conflict=channel,version`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(row)
  });
  if (!insert.ok) fail(`Recording the release failed (${insert.status}): ${await insert.text()}`);
  console.log(`\nPublished ${version} on the ${channel} channel. Running copies of OUTARCH will offer it within six hours, or at their next launch.`);
}

if (flag("upload")) publish().catch(error => fail(error.message));
else console.log("\nNot uploaded. Run again with --upload (and SUPABASE_SERVICE_ROLE_KEY set) to publish it.");
