import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const fail = message => {
  console.error(`Verification failed: ${message}`);
  process.exitCode = 1;
};

const repository = JSON.parse(readFileSync("repo.json", "utf8"));
const manifest = JSON.parse(readFileSync("builds/fakeprofile/manifest.json", "utf8"));
const directManifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const entrypointPath = `builds/fakeprofile/${manifest.main}`;
const entrypoint = readFileSync(entrypointPath, "utf8");
const legacyEntrypoint = readFileSync("index.js", "utf8");
const entrypointHash = createHash("sha256").update(entrypoint).digest("hex");

const syntax = spawnSync(process.execPath, ["--check", entrypointPath], {
  encoding: "utf8"
});

if (syntax.status !== 0) {
  fail(syntax.stderr.trim() || `${entrypointPath} has invalid JavaScript syntax`);
}

if (manifest.id !== "fakeprofile") fail("manifest id must be fakeprofile");
if (manifest.spec !== 3) fail("manifest must use Bunny plugin spec 3");
if (manifest.type !== "plugin") fail("manifest type must be plugin");
if (manifest.version !== repository.fakeprofile?.version) fail("repo and manifest versions must match");
if (directManifest.version !== manifest.version) fail("direct and repository manifest versions must match");
if (directManifest.main !== entrypointPath) fail("direct manifest must point to the packaged entrypoint");
if (directManifest.hash !== entrypointHash) fail("direct manifest hash must match the packaged entrypoint");
if (legacyEntrypoint !== entrypoint) fail("root entrypoint must match the packaged entrypoint");

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
  '"getUserAvatarSource"',
  '"Profile picture"',
  '"Profile banner"',
  '"Choose photo / GIF"',
  '"Choose file"',
  '"ANIMATED GIF"',
  '"[FakeProfile] Some preview hooks are unavailable',
  "var plugin = (() =>",
  "const storage = bunny.plugin.createStorage()",
  "SettingsComponent: Settings"
]) {
  if (!entrypoint.includes(feature)) fail(`missing preview feature marker: ${feature}`);
}

if (!process.exitCode) {
  console.log("Verified Bunny spec 3 packaging, JavaScript syntax, source layout, and GIF preview hooks.");
}
