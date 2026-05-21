const fs = require("fs");
const path = require("path");

let config;
try {
  const configPath = path.resolve(__dirname, "..", "..", "config.json");
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (err) {
  console.error("[postbuild] Error loading config.json:", err);
  process.exit(1);
}

let angularConfig;
let projectName;
try {
  const angularConfigPath = path.resolve(__dirname, "..", "..", "angular.json");
  angularConfig = JSON.parse(fs.readFileSync(angularConfigPath, "utf8"));
  projectName = Object.keys(angularConfig.projects)[0]; // Get the first (and likely only) project name
} catch (err) {
  console.error("[postbuild] Error loading angular.json:", err);
  process.exit(1);
}

const src = path.resolve(__dirname, "..", "..", "dist", projectName);
const dest = path.resolve(
  config["creatio-instance"].path,
  "Terrasoft.WebApp",
  "Terrasoft.Configuration",
  "Pkg",
  config["creatio-instance"].package,
  "Files",
  "src",
  "js",
  projectName
);

try {
  if (!fs.existsSync(src)) {
    console.warn("[postbuild] Source not found at", src, "- skipping copy.");
    process.exit(0);
  }
  // Ensure parent directory exists
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  // Copy source to dest
  fs.cpSync(src, dest, { recursive: true });
  console.log("\x1b[32mCopied\x1b[0m", src, "\x1b[32mto\x1b[0m", dest);
  process.exit(0);
} catch (err) {
  console.error("[postbuild] Error during copy:", err);
  process.exit(2);
}
