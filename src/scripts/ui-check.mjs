import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIR = path.join(ROOT, "src", "ui", "lovable", "fee-confidence");

const exts = new Set([".ts", ".tsx"]);
const readAllFiles = (dir) => {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...readAllFiles(full));
    else if (exts.has(path.extname(ent.name))) out.push(full);
  }
  return out;
};

const files = readAllFiles(TARGET_DIR);

const check = (name, pattern) => {
  const hits = [];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, i) => {
      if (pattern.test(line)) {
        hits.push({ file, line: i + 1, text: line.trim() });
      }
    });
  }

  if (hits.length) {
    console.log(`❌ ${name} found in lovable UI:`);
    for (const h of hits) {
      console.log(`${path.relative(ROOT, h.file)}:${h.line}  ${h.text}`);
    }
    process.exitCode = 1;
  } else {
    console.log(`✅ ${name}: OK`);
  }
};

check("Alias imports (@/)", /['"]@\/[^'"]+['"]/);

check(
  "Disallowed UI deps",
  /(@radix-ui\/|class-variance-authority|tailwind-merge|\bcva\s*\()/,
);

if (process.exitCode) process.exit(process.exitCode);