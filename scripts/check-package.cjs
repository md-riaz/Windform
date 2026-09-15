const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const packagePath = path.resolve(__dirname, '../package.json');
const manifest = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const expectedFiles = [
  'CHANGELOG.md',
  'LICENSE',
  'README.md',
  'src/windform.css',
  'tailwind.config.js',
];

assert.deepEqual([...manifest.files].sort(), expectedFiles, 'Package files allow-list changed unexpectedly.');
assert.equal(manifest.exports['./windform.css'], './src/windform.css');
assert.equal(manifest.exports['./tailwind.config'], './tailwind.config.js');
assert.equal(manifest.peerDependencies.tailwindcss, '^4.3.0');
assert.equal(manifest.peerDependenciesMeta.bootstrap.optional, true);
console.log(`Validated package manifest (${manifest.files.length} publishable artifacts).`);
