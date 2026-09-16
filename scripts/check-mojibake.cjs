const fs = require('node:fs');
const path = require('node:path');

const roots = ['docs'];
const extensions = new Set(['.html', '.css', '.md']);
const patterns = [/Ã/, /Â/, /â[\u0080-\u00bf€]/, /�/];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (extensions.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

const matches = [];
for (const root of roots) {
  for (const file of walk(root)) {
    const text = fs.readFileSync(file, 'utf8');
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (patterns.some((pattern) => pattern.test(line))) {
        matches.push(`${file}:${index + 1}: ${line.trim()}`);
      }
    });
  }
}

if (matches.length > 0) {
  console.error(`Found possible mojibake artifacts:\n${matches.slice(0, 80).join('\n')}`);
  if (matches.length > 80) console.error(`...and ${matches.length - 80} more`);
  process.exit(1);
}

console.log('Validated docs text has no common mojibake artifacts.');
