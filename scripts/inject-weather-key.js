// Provides the OpenWeather API key without ever writing it into a git-tracked file.
//
// Modes:
//   dev   - (re)generates the gitignored src/environments/environment.dev.ts used by `ng serve`.
//   build - patches the *compiled* output in www/ after a production build. The tracked
//           environment.prod.ts keeps only the "MY_OPENWEATHER_API_KEY" placeholder.
//
// Key source, in order of precedence:
//   1. OPENWEATHER_API_KEY env var (used in CI)
//   2. an `openweatherkey` file in the project root (gitignored, for local dev)
// If neither is present, the placeholder is left in place and weather forecasts won't work.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PLACEHOLDER = "MY_OPENWEATHER_API_KEY";
const root = path.join(__dirname, "..");
const keyFile = path.join(root, "openweatherkey");
const apiKey = process.env.OPENWEATHER_API_KEY || (fs.existsSync(keyFile) ? fs.readFileSync(keyFile, "utf8").trim() : "");

function injectDev() {
  const sourcePath = path.join(root, "src/environments/environment.ts");
  const devPath = path.join(root, "src/environments/environment.dev.ts");
  const contents = fs.readFileSync(sourcePath, "utf8");
  const withKey = apiKey ? contents.replace(/OPENWEATHER_API_KEY:\s*["'].*?["']/, `OPENWEATHER_API_KEY: "${apiKey}"`) : contents;
  fs.writeFileSync(devPath, withKey);

  if (!apiKey) {
    console.warn(`No OpenWeather API key found (OPENWEATHER_API_KEY env var or ./openweatherkey file). Weather forecasts won't work locally.`);
  }
}

function injectBuild() {
  const outputDir = path.join(root, "www");
  if (!fs.existsSync(outputDir)) {
    return;
  }
  if (!apiKey) {
    console.warn(`No OpenWeather API key found. Build output keeps the "${PLACEHOLDER}" placeholder; weather forecasts won't work.`);
    return;
  }

  const patchedFiles = [];
  for (const name of fs.readdirSync(outputDir)) {
    if (!name.endsWith(".js")) continue;
    const filePath = path.join(outputDir, name);
    const contents = fs.readFileSync(filePath, "utf8");
    if (contents.includes(PLACEHOLDER)) {
      fs.writeFileSync(filePath, contents.split(PLACEHOLDER).join(apiKey));
      patchedFiles.push(filePath);
    }
  }

  // The Angular service worker (ngsw.json) stores a content hash per asset for integrity
  // checks. Patched files must have their hash updated, or the service worker will treat
  // them as corrupted.
  const ngswPath = path.join(outputDir, "ngsw.json");
  if (patchedFiles.length && fs.existsSync(ngswPath)) {
    const ngsw = JSON.parse(fs.readFileSync(ngswPath, "utf8"));
    for (const filePath of patchedFiles) {
      const key = "/" + path.relative(outputDir, filePath).split(path.sep).join("/");
      if (ngsw.hashTable && key in ngsw.hashTable) {
        ngsw.hashTable[key] = crypto.createHash("sha1").update(fs.readFileSync(filePath)).digest("hex");
      }
    }
    fs.writeFileSync(ngswPath, JSON.stringify(ngsw));
  }

  console.log(`OpenWeather API key injected into ${patchedFiles.length} build output file(s).`);
}

const mode = process.argv[2];
if (mode === "dev") {
  injectDev();
} else if (mode === "build") {
  injectBuild();
} else {
  console.error("Usage: node scripts/inject-weather-key.js <dev|build>");
  process.exit(1);
}
