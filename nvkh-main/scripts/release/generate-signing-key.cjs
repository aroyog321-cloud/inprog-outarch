#!/usr/bin/env node
"use strict";

// Creates the Ed25519 key pair OUTARCH releases are signed with.
//
//   node scripts/release/generate-signing-key.cjs [--out <private key path>]
//
// The private key is written outside the repository (by default
// %USERPROFILE%\.outarch\release-signing-key.pem) and must never be committed
// or shared: anyone holding it can publish an update every OUTARCH will install.
// Back it up somewhere safe. The public key it prints goes in
// src/service/updateConfig.cjs.
//
// It refuses to overwrite an existing key, because every installed app trusts
// only the public half of the key that was current when it was built.

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const outIndex = process.argv.indexOf("--out");
const target = path.resolve(outIndex > 0 && process.argv[outIndex + 1] ? process.argv[outIndex + 1] : path.join(os.homedir(), ".outarch", "release-signing-key.pem"));
const repo = path.resolve(__dirname, "..", "..");

if (target.startsWith(repo + path.sep)) {
  console.error("Refusing to write the private key inside the repository. Choose a path outside it.");
  process.exit(1);
}
if (fs.existsSync(target)) {
  console.error(`A signing key already exists at ${target}. Delete it yourself first if you really mean to replace it.`);
  process.exit(1);
}

const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, privateKey.export({ type: "pkcs8", format: "pem" }), { mode: 0o600, flag: "wx" });
const publicPem = publicKey.export({ type: "spki", format: "pem" }).toString().trim();

console.log(`Private signing key written to: ${target}`);
console.log("Back it up. Do not commit or share it.\n");
console.log("Public key (put it in src/service/updateConfig.cjs):\n");
console.log(publicPem);
