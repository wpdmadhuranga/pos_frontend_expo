const fs = require("fs");
const path = require("path");

const input = process.argv[2];
if (!input || !fs.existsSync(input)) {
  console.error(
    "Logo not found. Usage: node utils/make-logo.js <path-to-logo>",
  );
  process.exit(1);
}

const ext = path.extname(input).toLowerCase();
const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
const base64 = fs.readFileSync(input).toString("base64");

const outDir = path.join(__dirname, "..", "constants");
fs.mkdirSync(outDir, { recursive: true });
const output = path.join(outDir, "logo.ts");

fs.writeFileSync(
  output,
  `export const LOGO_DATA_URI = "data:${mime};base64,${base64}";\n`,
  "utf8",
);
console.log("Created", output);
