import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const fail = message => {
  console.error(`Verification failed: ${message}`);
  process.exitCode = 1;
};

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const entrypoint = readFileSync(manifest.main, "utf8");
const entrypointHash = createHash("sha256").update(entrypoint).digest("hex");

const syntax = spawnSync(process.execPath, ["--check", manifest.main], {
  encoding: "utf8"
});

if (syntax.status !== 0) {
  fail(syntax.stderr.trim() || `${manifest.main} has invalid JavaScript syntax`);
}

if (manifest.hash !== entrypointHash) {
  fail(`manifest hash does not match ${manifest.main}; expected ${entrypointHash}`);
}

for (const path of [
  "src/api/index.ts",
  "src/sincordplugins/fakeProfile/index.tsx",
  "src/sincordplugins/fakeProfile/style.css",
  "src/utils/types.ts",
  "src/webpack/index.ts"
]) {
  if (!existsSync(path)) fail(`missing restored source path: ${path}`);
}

const flattenedSources = readdirSync(".").filter(name => name.startsWith("src__"));
if (flattenedSources.length) {
  fail(`flattened source files remain: ${flattenedSources.join(", ")}`);
}

for (const feature of [
  "storage.avatarMedia ??= null",
  "storage.bannerMedia ??= null",
  '"launchImageLibrary"',
  '"pickSingle"',
  '"saveDocuments"',
  '"getUserAvatarURL"',
  '"Profile picture"',
  '"Profile banner"',
  '"Choose photo / GIF"',
  '"Choose file"',
  '"ANIMATED GIF"'
]) {
  if (!entrypoint.includes(feature)) fail(`missing preview feature marker: ${feature}`);
}

if (!process.exitCode) {
  console.log("Verified JavaScript syntax, manifest integrity, source layout, and GIF preview hooks.");
}
