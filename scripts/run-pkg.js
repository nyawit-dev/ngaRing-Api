const { execSync } = require('child_process');
const [,, pkg, script] = process.argv;

if (!pkg || !script) {
  console.error('Usage: node scripts/run-pkg.js <package-name> <script-name>');
  process.exit(1);
}

const isBun = typeof Bun !== 'undefined' || !!process.versions.bun;
const cmd = isBun
  ? `bun run --cwd packages/${pkg} ${script}`
  : `npm run ${script} --workspace=packages/${pkg}`;

try {
  execSync(cmd, { stdio: 'inherit' });
} catch (err) {
  process.exit(err.status || 1);
}
