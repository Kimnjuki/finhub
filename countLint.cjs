const { execSync } = require('child_process');
const fs = require('fs');
try {
  const out = execSync('npx eslint . --format=json', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  const data = JSON.parse(out);
  const errs = data.reduce((s, f) => s + (f.errorCount || 0), 0);
  const filesWithErrors = data.filter(f => (f.errorCount || 0) > 0).map(f => ({ file: f.filePath, count: f.errorCount }));
  fs.writeFileSync('lint-summary.json', JSON.stringify({ total: errs, files: filesWithErrors }, null, 2));
  console.log('Total errors:', errs);
  console.log('Files with errors:', filesWithErrors.length);
} catch (e) {
  console.error('Failed:', e.message);
  process.exit(1);
}