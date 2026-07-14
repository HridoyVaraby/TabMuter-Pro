import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const manifestPath = path.join(root, "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function assertFile(relativePath) {
  await access(path.join(root, relativePath));
}

async function readPngDimensions(relativePath) {
  const image = await readFile(path.join(root, relativePath));
  const signature = image.subarray(0, 8).toString("hex");

  assert(signature === "89504e470d0a1a0a", `${relativePath} is not a PNG file.`);
  assert(image.subarray(12, 16).toString("ascii") === "IHDR", `${relativePath} has no PNG IHDR chunk.`);

  return {
    width: image.readUInt32BE(16),
    height: image.readUInt32BE(20),
  };
}

assert(manifest.manifest_version === 3, "manifest.json must use Manifest V3.");
assert(manifest.name === "Auto Website Muter", "Unexpected extension name.");
assert(manifest.background?.service_worker === "background.js", "Missing background service worker.");
assert(manifest.action?.default_popup === "popup.html", "Missing default popup.");

const permissions = new Set(manifest.permissions);
assert(permissions.size === 2, "The extension should request exactly two permissions.");
assert(permissions.has("storage") && permissions.has("tabs"), "Required permissions are missing.");

const requiredFiles = [
  "manifest.json",
  "background.js",
  "popup.html",
  "popup.js",
  manifest.background.service_worker,
  manifest.action.default_popup,
  ...Object.values(manifest.icons ?? {}),
  ...Object.values(manifest.action.default_icon ?? {}),
];

await Promise.all([...new Set(requiredFiles)].map(assertFile));

for (const [declaredSize, iconPath] of Object.entries(manifest.icons)) {
  const expectedSize = Number(declaredSize);
  const dimensions = await readPngDimensions(iconPath);

  assert(
    dimensions.width === expectedSize && dimensions.height === expectedSize,
    `${iconPath} must be ${expectedSize}x${expectedSize}px.`,
  );
}

const popupHtml = await readFile(path.join(root, "popup.html"), "utf8");
assert(popupHtml.includes('<script src="popup.js"></script>'), "popup.html must load popup.js externally.");
assert(!/\son[a-z]+\s*=/i.test(popupHtml), "Inline HTML event handlers are not allowed.");

console.log("Extension structure, permissions, assets, and popup CSP checks passed.");
